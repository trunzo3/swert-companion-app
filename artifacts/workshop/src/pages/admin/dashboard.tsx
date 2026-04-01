import { useEffect } from "react";
import { useLocation } from "wouter";
import { getAdminAuth, setAdminAuth } from "@/lib/auth";
import { 
  useGetAdminStats, 
  useGetParticipants, 
  useGetAdminSections, 
  useUpdateSectionCode,
  useGetSafariWorksheets,
  useCreateSafariWorksheet,
  useUpdateSafariWorksheet,
  useDeleteSafariWorksheet,
  useGetAdminFeedback
} from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, KeyRound, Map, MessageSquare, LogOut, Check, X, Trash2 } from "lucide-react";
import { format } from "date-fns";

function StatsCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: any }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!getAdminAuth()) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const { data: stats } = useGetAdminStats({ query: { refetchInterval: 10000 } });
  const { data: participants = [] } = useGetParticipants();
  const { data: sections = [], refetch: refetchSections } = useGetAdminSections();
  const { data: worksheets = [], refetch: refetchWorksheets } = useGetSafariWorksheets();
  const { data: feedback = [] } = useGetAdminFeedback();

  const updateSectionCode = useUpdateSectionCode();
  const createWorksheet = useCreateSafariWorksheet();
  const updateWorksheet = useUpdateSafariWorksheet();
  const deleteWorksheet = useDeleteSafariWorksheet();

  const handleLogout = () => {
    setAdminAuth(false);
    setLocation("/admin/login");
  };

  const handleCodeUpdate = (sectionId: string, code: string, codeActive: boolean) => {
    updateSectionCode.mutate(
      { data: { sectionId, code, codeActive } },
      { onSuccess: () => refetchSections() }
    );
  };

  const addWorksheet = () => {
    createWorksheet.mutate(
      { data: { name: "New Tool" } },
      { onSuccess: () => refetchWorksheets() }
    );
  };

  if (!getAdminAuth()) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-950 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold font-serif">IQmeetEQ Admin</h1>
          <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5 mb-8">
          <StatsCard title="Total Participants" value={stats?.totalParticipants || 0} icon={Users} />
          <StatsCard title="Active Today" value={stats?.activeToday || 0} icon={Users} />
          <StatsCard title="Sections Unlocked" value={stats?.sectionsUnlocked || 0} icon={KeyRound} />
          <StatsCard title="Workflow Maps" value={stats?.totalWorkflowMaps || 0} icon={Map} />
          <StatsCard title="Feedback Received" value={stats?.feedbackSubmissions || 0} icon={MessageSquare} />
        </div>

        <Tabs defaultValue="participants" className="w-full bg-white rounded-lg shadow-sm border p-6">
          <TabsList className="mb-6 bg-slate-100">
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="sections">Section Codes</TabsTrigger>
            <TabsTrigger value="worksheets">Safari Worksheets</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="participants">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Email</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-center">Sections</TableHead>
                    <TableHead className="text-center">Has Notes</TableHead>
                    <TableHead className="text-center">Has Workflows</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.email}</TableCell>
                      <TableCell>{format(new Date(p.lastLoginAt), "MMM d, h:mm a")}</TableCell>
                      <TableCell className="text-center">{p.sectionsOpened}</TableCell>
                      <TableCell className="text-center">{p.hasNotes ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</TableCell>
                      <TableCell className="text-center">{p.hasWorkflowMaps ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</TableCell>
                    </TableRow>
                  ))}
                  {participants.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No participants yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="sections">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Section</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Unlock Code</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map(s => {
                    // Simple inline state for local edits before saving
                    return (
                      <SectionRow 
                        key={s.id} 
                        section={s} 
                        onSave={(code, active) => handleCodeUpdate(s.id, code, active)} 
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="worksheets">
            <div className="flex justify-end mb-4">
              <Button onClick={addWorksheet}><Plus className="w-4 h-4 mr-2" /> Add Tool</Button>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Tool Name</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {worksheets.map(w => (
                    <WorksheetRow 
                      key={w.id} 
                      worksheet={w} 
                      onUpdate={(data) => updateWorksheet.mutate({ id: w.id, data }, { onSuccess: () => refetchWorksheets() })}
                      onDelete={() => deleteWorksheet.mutate({ id: w.id }, { onSuccess: () => refetchWorksheets() })}
                    />
                  ))}
                  {worksheets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No worksheets configured</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="feedback">
            <div className="space-y-4">
              {feedback.map(f => (
                <Card key={f.id}>
                  <CardHeader className="py-3 bg-slate-50">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{f.participantEmail}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(f.updatedAt), "MMM d, h:mm a")}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4">
                    <p className="whitespace-pre-wrap">{f.content}</p>
                  </CardContent>
                </Card>
              ))}
              {feedback.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-slate-50 text-muted-foreground">
                  No feedback received yet
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Helper components for rows with local state
import { useState } from "react";
import { Plus } from "lucide-react";

function SectionRow({ section, onSave }: { section: any, onSave: (c: string, a: boolean) => void }) {
  const [code, setCode] = useState(section.code);
  const [active, setActive] = useState(section.codeActive);
  const isDirty = code !== section.code || active !== section.codeActive;

  return (
    <TableRow>
      <TableCell className="font-medium">{section.title}</TableCell>
      <TableCell>
        <Badge variant={section.tier === 1 ? "default" : "secondary"}>Tier {section.tier}</Badge>
      </TableCell>
      <TableCell>
        <Input 
          value={code} 
          onChange={(e) => setCode(e.target.value.toUpperCase())} 
          className="w-32 uppercase"
          disabled={section.tier > 1}
        />
      </TableCell>
      <TableCell>
        <Switch 
          checked={active} 
          onCheckedChange={setActive} 
          disabled={section.tier > 1}
        />
      </TableCell>
      <TableCell>
        {isDirty && (
          <Button size="sm" onClick={() => onSave(code, active)}>Save</Button>
        )}
      </TableCell>
    </TableRow>
  );
}

function WorksheetRow({ worksheet, onUpdate, onDelete }: { worksheet: any, onUpdate: (d: any) => void, onDelete: () => void }) {
  const [name, setName] = useState(worksheet.name);
  const [active, setActive] = useState(worksheet.active);
  const isDirty = name !== worksheet.name || active !== worksheet.active;

  return (
    <TableRow>
      <TableCell>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </TableCell>
      <TableCell>
        <Switch checked={active} onCheckedChange={setActive} />
      </TableCell>
      <TableCell className="flex gap-2 justify-end">
        {isDirty && <Button size="sm" onClick={() => onUpdate({ name, active })}>Save</Button>}
        <Button size="icon" variant="ghost" className="text-destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
