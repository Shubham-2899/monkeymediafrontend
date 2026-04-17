import React, { useState, useCallback, useRef } from "react";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { search, openSearchPanel } from "@codemirror/search";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import {
  Box, Stack, Button, IconButton, Tooltip,
  TextField, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchIcon from "@mui/icons-material/Search";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import DataObjectIcon from "@mui/icons-material/DataObject";
import CheckIcon from "@mui/icons-material/Check";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TemplateBuilderProps {
  initialValue?: string;
  onUse: (html: string) => void;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract all unique {{variable}} placeholders from HTML */
function extractVariables(code: string): string[] {
  const matches = code.matchAll(/\{\{(\w+)\}\}/g);
  const seen = new Set<string>();
  for (const m of matches) seen.add(m[1]);
  return Array.from(seen);
}

/** Build a JSON object with empty string values for each variable */
function buildVariableJson(vars: string[]): string {
  if (vars.length === 0) return "{}";
  const obj: Record<string, string> = {};
  vars.forEach((v) => (obj[v] = ""));
  return JSON.stringify(obj, null, 2);
}

// ─── Component ────────────────────────────────────────────────────────────────

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  initialValue = "",
  onUse,
  onClose,
}) => {
  const [code, setCode] = useState(initialValue);
  const [templateName, setTemplateName] = useState("Template");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Copy feedback states
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [copiedVars, setCopiedVars] = useState(false);

  const editorRef = useRef<ReactCodeMirrorRef>(null);

  // ── Copy template HTML ──────────────────────────────────────────────────────
  const handleCopyTemplate = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedTemplate(true);
      setTimeout(() => setCopiedTemplate(false), 2000);
    });
  }, [code]);

  // ── Open search panel in editor ─────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    const view = editorRef.current?.view;
    if (view) openSearchPanel(view);
  }, []);

  // ── Copy variables as JSON ──────────────────────────────────────────────────
  const handleCopyVariables = useCallback(() => {
    const vars = extractVariables(code);
    const json = buildVariableJson(vars);
    navigator.clipboard.writeText(json).then(() => {
      setCopiedVars(true);
      setTimeout(() => setCopiedVars(false), 2000);
    });
  }, [code]);

  // ── Use template — inject back into campaign form ───────────────────────────
  const handleUse = () => {
    onUse(code);
    onClose();
  };

  // ── Preview width ───────────────────────────────────────────────────────────
  const previewWidth = previewMode === "mobile" ? 375 : "100%";

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        position: "fixed",
        top: 76,        // sit below the sticky app header (minHeight: 76)
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9800,   // below header (9900) so header stays visible
        display: "flex",
        flexDirection: "column",
        background: "#1e1e1e",
      }}
    >
      {/* ── Top bar ── */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          px: 2,
          py: 1,
          background: "#1e1e1e",
          borderBottom: "1px solid #3e3e42",
          flexShrink: 0,
        }}
      >
        {/* Close */}
        <Tooltip title="Close builder" arrow>
          <IconButton size="small" onClick={onClose} sx={{ color: "#d4d4d4", "&:hover": { background: "#3e3e42" } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Template name */}
        <TextField
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          variant="standard"
          inputProps={{ style: { color: "#d4d4d4", fontSize: 15, fontWeight: 500 } }}
          sx={{
            flexGrow: 1,
            maxWidth: 320,
            "& .MuiInput-underline:before": { borderBottomColor: "#555" },
            "& .MuiInput-underline:hover:before": { borderBottomColor: "#888" },
            "& .MuiInput-underline:after": { borderBottomColor: "#1976d2" },
          }}
        />

        <Box sx={{ flexGrow: 1 }} />

        {/* Use Template */}
        <Button
          variant="contained"
          size="small"
          onClick={handleUse}
          sx={{ textTransform: "none", fontWeight: 600, minWidth: 120, bgcolor: "#0e639c", "&:hover": { bgcolor: "#1177bb" } }}
        >
          Use Template
        </Button>
      </Stack>

      {/* ── Split pane ── */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left: Code editor ── */}
        <Box
          sx={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid #333",
            overflow: "hidden",
          }}
        >
          {/* Editor toolbar */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
            spacing={0.5}
            sx={{ px: 1, py: 0.75, background: "#252526", borderBottom: "1px solid #3e3e42" }}
          >
            <Tooltip title={copiedTemplate ? "Copied!" : "Copy template"} arrow>
              <IconButton size="small" onClick={handleCopyTemplate} sx={{ color: copiedTemplate ? "#4caf50" : "#ccc" }}>
                {copiedTemplate ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Search in editor (Ctrl+F)" arrow>
              <IconButton size="small" onClick={handleSearch} sx={{ color: "#ccc" }}>
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* CodeMirror editor */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <CodeMirror
              ref={editorRef}
              value={code}
              height="100%"
              theme={vscodeDark}
              extensions={[html(), search()]}
              onChange={(val) => setCode(val)}
              style={{ fontSize: 13, height: "100%" }}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: true,
                autocompletion: true,
                bracketMatching: true,
                indentOnInput: true,
              }}
            />
          </Box>
        </Box>

        {/* ── Right: Preview ── */}
        <Box
          sx={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            background: "#f0f0f0",
            overflow: "hidden",
          }}
        >
          {/* Preview toolbar */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ px: 2, py: 1, background: "#fff", borderBottom: "1px solid #ddd", flexShrink: 0 }}
          >
            {/* Copy Variables */}
            <Tooltip
              title={
                copiedVars
                  ? "Copied!"
                  : `Copy variables as JSON — e.g. {"FirstName": "", "lastname": ""}`
              }
              arrow
            >
              <Button
                size="small"
                variant={copiedVars ? "contained" : "outlined"}
                color={copiedVars ? "success" : "primary"}
                startIcon={copiedVars ? <CheckIcon /> : <DataObjectIcon />}
                onClick={handleCopyVariables}
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {copiedVars ? "Copied!" : "Copy Variables"}
              </Button>
            </Tooltip>

            <Box sx={{ flexGrow: 1 }} />

            {/* Desktop / Mobile toggle */}
            <ToggleButtonGroup
              value={previewMode}
              exclusive
              onChange={(_, val) => val && setPreviewMode(val)}
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  py: 0.5,
                  px: 1.5,
                  border: "1px solid #ccc",
                  "&.Mui-selected": {
                    background: "#1976d2",
                    color: "#fff",
                    "&:hover": { background: "#1565c0" },
                  },
                },
              }}
            >
              <ToggleButton value="desktop">
                <Tooltip title="Desktop preview" arrow>
                  <DesktopWindowsIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="mobile">
                <Tooltip title="Mobile preview (375px)" arrow>
                  <PhoneIphoneIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {/* Preview iframe */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              display: "flex",
              justifyContent: "center",
              p: previewMode === "mobile" ? 2 : 0,
              background: previewMode === "mobile" ? "#e0e0e0" : "#f0f0f0",
            }}
          >
            <Box
              sx={{
                width: previewWidth,
                height: "100%",
                background: "#fff",
                boxShadow: previewMode === "mobile" ? "0 4px 20px rgba(0,0,0,0.2)" : "none",
                borderRadius: previewMode === "mobile" ? 2 : 0,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <iframe
                title="Email Preview"
                srcDoc={code || "<p style='color:#aaa;padding:24px;font-family:sans-serif'>Start typing HTML to see a preview…</p>"}
                style={{ width: "100%", height: "100%", border: "none" }}
                sandbox="allow-same-origin"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TemplateBuilder;
