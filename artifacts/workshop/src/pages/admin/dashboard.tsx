import { useState, useEffect, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Users, BookOpen, KeyRound, Map, MessageSquare, LogOut, Check, X, Trash2, Plus, Upload, FileText, UploadCloud } from "lucide-react";
import { format } from "date-fns";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

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

function HomeContentEditor() {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`${BASE}/api/home-content`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.content) setContent(d.content); })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`${BASE}/api/admin/home-content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setMsg("Saved successfully.");
      } else {
        setMsg("Save failed.");
      }
    } catch {
      setMsg("Connection error.");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-semibold mb-2 block">Facilitator Message (shown on participant Home page)</Label>
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={8}
          placeholder="Enter message for participants..."
          className="font-sans text-sm"
        />
      </div>
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Message"}
        </Button>
        {msg && <span className={`text-sm font-medium ${msg.includes("success") ? "text-green-600" : "text-red-600"}`}>{msg}</span>}
      </div>
      <p className="text-xs text-muted-foreground">Changes appear immediately for all participants.</p>
    </div>
  );
}

interface SectionFile {
  id: number;
  displayName: string;
  sectionId: string;
  toolTab: string | null;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
}

function FileManagerTab({ worksheets }: { worksheets: { id: number; name: string }[] }) {
  const [files, setFiles] = useState<SectionFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedSection, setSelectedSection] = useState("tool-safari");
  const [selectedTab, setSelectedTab] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [msg, setMsg] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const SECTIONS_WITH_FILES = [
    { id: "tool-safari", label: "Tool Safari" },
    { id: "verification-test", label: "Verification Test" },
    { id: "capstone", label: "Capstone" },
  ];

  const ACCEPTED = ".pdf,.docx,.xlsx,.pptx,.txt,.csv,.png,.jpg,.jpeg";
  const MAX_BYTES = 10 * 1024 * 1024;

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch(`${BASE}/api/files/by-section/${selectedSection}`, { credentials: "include" });
      if (res.ok) setFiles(await res.json());
    } catch {}
    setLoadingFiles(false);
  };

  useEffect(() => { loadFiles(); }, [selectedSection]);

  const acceptFile = (file: File) => {
    if (file.size > MAX_BYTES) { setMsg("File exceeds 10 MB limit."); return; }
    setPendingFile(file);
    setMsg("");
    if (!displayName) setDisplayName(file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) acceptFile(file);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!pendingFile) { setMsg("Please select a file."); return; }
    setUploading(true);
    setMsg("");
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64Data = (ev.target?.result as string).split(",")[1];
        const res = await fetch(`${BASE}/api/admin/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            sectionId: selectedSection,
            toolTab: selectedTab || null,
            displayName: displayName || pendingFile.name,
            mimeType: pendingFile.type || "application/pdf",
            fileData: base64Data,
          }),
        });
        if (res.ok) {
          setMsg("File uploaded!");
          setDisplayName("");
          setPendingFile(null);
          await loadFiles();
        } else {
          const err = await res.json().catch(() => ({}));
          setMsg(err.error || "Upload failed.");
        }
        setUploading(false);
        setTimeout(() => setMsg(""), 4000);
      };
      reader.onerror = () => { setMsg("Could not read file."); setUploading(false); };
      reader.readAsDataURL(pendingFile);
    } catch {
      setMsg("Upload error.");
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this file?")) return;
    const res = await fetch(`${BASE}/api/admin/files/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) await loadFiles();
  };

  const formatBytes = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="space-y-8">
      <div className="bg-slate-50 border rounded-lg p-5 space-y-4">
        <h3 className="font-semibold text-slate-800">Upload File</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs mb-1 block">Section</Label>
            <select
              value={selectedSection}
              onChange={e => { setSelectedSection(e.target.value); setSelectedTab(""); }}
              className="w-full h-9 border border-input rounded-md px-3 py-1 text-sm bg-white"
            >
              {SECTIONS_WITH_FILES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          {selectedSection === "tool-safari" && (
            <div>
              <Label className="text-xs mb-1 block">Tool Tab (optional)</Label>
              <select
                value={selectedTab}
                onChange={e => setSelectedTab(e.target.value)}
                className="w-full h-9 border border-input rounded-md px-3 py-1 text-sm bg-white"
              >
                <option value="">— Any / General —</option>
                {worksheets.map(w => (
                  <option key={w.id} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <Label className="text-xs mb-1 block">Display Name</Label>
            <Input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. ChatGPT Safari Guide"
              className="text-sm"
            />
          </div>
        </div>

        {/* Drop zone */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={handleFileInput}
        />
        {!pendingFile ? (
          <div
            ref={dropZoneRef}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-8 px-4 cursor-pointer transition-colors ${dragging ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"}`}
          >
            <UploadCloud className="w-8 h-8 text-slate-400" />
            <p className="text-sm text-slate-600">Drag and drop a file here</p>
            <p className="text-sm text-slate-500">
              or{" "}
              <span
                className="underline text-slate-700 cursor-pointer"
                onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                browse to upload
              </span>
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF, max 10 MB</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-white">
            <FileText className="w-5 h-5 text-slate-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{pendingFile.name}</p>
              <p className="text-xs text-slate-400">{formatBytes(pendingFile.size)}</p>
            </div>
            <button
              onClick={() => { setPendingFile(null); setDisplayName(""); setMsg(""); }}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Button onClick={handleUpload} disabled={uploading || !pendingFile} size="sm">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          {msg && <span className={`text-sm font-medium ${msg.includes("!") ? "text-green-600" : "text-red-600"}`}>{msg}</span>}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-800 mb-3">Files in "{SECTIONS_WITH_FILES.find(s=>s.id===selectedSection)?.label}"</h3>
        {loadingFiles ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Display Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tool Tab</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map(f => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.displayName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{(f.mimeType ?? "").split("/")[1] ?? f.mimeType}</TableCell>
                    <TableCell>
                      {f.toolTab ? <Badge variant="outline">{f.toolTab}</Badge> : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(f.uploadedAt), "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(f.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {files.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No files uploaded for this section yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
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
          <TabsList className="mb-6 bg-slate-100 flex-wrap h-auto">
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="sections">Section Codes</TabsTrigger>
            <TabsTrigger value="worksheets">Safari Worksheets</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="home">Home Message</TabsTrigger>
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
                  {sections.map(s => (
                    <SectionRow
                      key={s.id}
                      section={s}
                      onSave={(code, active) => handleCodeUpdate(s.id, code, active)}
                    />
                  ))}
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

          <TabsContent value="files">
            <FileManagerTab worksheets={worksheets} />
          </TabsContent>

          <TabsContent value="home">
            <HomeContentEditor />
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
