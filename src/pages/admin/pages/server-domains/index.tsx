import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, Stack, Chip, IconButton, Tooltip,
  CircularProgress, Snackbar, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Switch,
  FormControlLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Collapse, Divider, Select, SelectChangeEvent,
} from "@mui/material";
import DnsIcon from "@mui/icons-material/Dns";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "../../../../utils/api";
import { ServerDomain, ServerDomainIp } from "../../../../Interfaces";

// ── Helpers ───────────────────────────────────────────────────────────────────
const emptyIp = () => ({ ip: "", isMainIp: false, wentSpam: false, provider: "" });
const emptyForm = () => ({ domain: "", status: "active" as "active" | "inactive", notes: "", ips: [emptyIp()] });

// ── Confirm Dialog ────────────────────────────────────────────────────────────
const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  confirmColor?: "error" | "warning" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, title, message, confirmLabel = "Confirm", confirmColor = "error", onConfirm, onCancel }) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ pb: 1 }}>{title}</DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary">{message}</Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
      <Button onClick={onCancel} variant="outlined" sx={{ textTransform: "none" }}>Cancel</Button>
      <Button onClick={onConfirm} variant="contained" color={confirmColor} sx={{ textTransform: "none" }}>
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

// ── IP Rows (expanded) ────────────────────────────────────────────────────────
const IpRows: React.FC<{
  serverId: string;
  ips: ServerDomainIp[];
  onRefresh: () => void;
  onSnackbar: (msg: string, sev: "success" | "error") => void;
}> = ({ serverId, ips, onRefresh, onSnackbar }) => {
  const [addOpen, setAddOpen] = useState(false);
  const [newIp, setNewIp] = useState(emptyIp());
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<{ type: "delete" | "spam"; ip: string; current?: boolean } | null>(null);
  const [warmingUpdating, setWarmingUpdating] = useState<string | null>(null); // ip being updated

  const handleWarmingChange = async (ip: string, warmingStatus: string) => {
    setWarmingUpdating(ip);
    try {
      await apiPut(`/servers-domains/${serverId}/ips/${ip}`, { warmingStatus });
      onSnackbar(`Warming status updated to "${warmingStatus}".`, "success");
      onRefresh();
    } catch { onSnackbar("Failed to update warming status.", "error"); }
    finally { setWarmingUpdating(null); }
  };

  const handleAdd = async () => {
    if (!newIp.ip || !newIp.provider) { onSnackbar("IP and provider are required.", "error"); return; }
    setSaving(true);
    try {
      await apiPost(`/servers-domains/${serverId}/ips`, newIp);
      onSnackbar("IP added successfully.", "success");
      setAddOpen(false);
      setNewIp(emptyIp());
      onRefresh();
    } catch { onSnackbar("Failed to add IP.", "error"); }
    finally { setSaving(false); }
  };

  const handleDeleteIp = async () => {
    if (!confirm) return;
    try {
      await apiDelete(`/servers-domains/${serverId}/ips/${confirm.ip}`);
      onSnackbar("IP removed.", "success");
      onRefresh();
    } catch { onSnackbar("Failed to remove IP.", "error"); }
    finally { setConfirm(null); }
  };

  const handleToggleSpam = async () => {
    if (!confirm) return;
    try {
      await apiPatch(`/servers-domains/${serverId}/ips/${confirm.ip}/spam`, { wentSpam: !confirm.current });
      onSnackbar(`Spam flag ${!confirm.current ? "set" : "cleared"}.`, "success");
      onRefresh();
    } catch { onSnackbar("Failed to update spam flag.", "error"); }
    finally { setConfirm(null); }
  };

  return (
    <>
      <Box sx={{ background: "#f9fafb", borderTop: "1px solid #e8eaed" }}>
        <Box sx={{ px: 3, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ letterSpacing: 0.5, textTransform: "uppercase", fontSize: 11 }}>
            IP Addresses
          </Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}
            sx={{ textTransform: "none", fontSize: 13 }}>
            Add IP
          </Button>
        </Box>

        <Table size="small" sx={{ "& td, & th": { px: 3 } }}>
          <TableHead>
            <TableRow sx={{ "& th": { fontWeight: 600, fontSize: 12, color: "#666", background: "#f1f3f4", borderBottom: "1px solid #e0e0e0" } }}>
              <TableCell>IP Address</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="inherit">Warming</Typography>
                  <Tooltip title="cold → warming → warmed. Only 'warmed' IPs are included in round-robin sending." arrow placement="top">
                    <InfoOutlinedIcon sx={{ fontSize: 14, color: "#9e9e9e", cursor: "help" }} />
                  </Tooltip>
                </Stack>
              </TableCell>
              <TableCell>Spam Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ips.map((entry) => (
              <TableRow key={entry.ip} sx={{ "&:hover": { background: "#f0f4ff" }, "& td": { borderBottom: "1px solid #f0f0f0" } }}>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace" fontWeight={500}>{entry.ip}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{entry.provider}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={entry.isMainIp ? "Main" : "Sub"}
                    size="small"
                    color={entry.isMainIp ? "primary" : "default"}
                    variant="outlined"
                    sx={{ fontWeight: 500, fontSize: 11 }}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={entry.warmingStatus || 'cold'}
                    disabled={warmingUpdating === entry.ip}
                    onChange={(e: SelectChangeEvent) => handleWarmingChange(entry.ip, e.target.value)}
                    sx={{
                      fontSize: 12,
                      minWidth: 110,
                      '& .MuiSelect-select': { py: 0.5 },
                      color: entry.warmingStatus === 'warmed'
                        ? '#2e7d32'
                        : entry.warmingStatus === 'warming'
                          ? '#e65100'
                          : '#666',
                    }}
                  >
                    <MenuItem value="cold" sx={{ fontSize: 12 }}>❄️ Cold</MenuItem>
                    <MenuItem value="warming" sx={{ fontSize: 12 }}>🔥 Warming</MenuItem>
                    <MenuItem value="warmed" sx={{ fontSize: 12 }}>✅ Warmed</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  {entry.wentSpam ? (
                    <Chip icon={<ReportProblemOutlinedIcon />} label="Spam" size="small" color="error" variant="filled" sx={{ fontSize: 11 }} />
                  ) : (
                    <Chip icon={<CheckCircleOutlineIcon />} label="Clean" size="small" color="success" variant="outlined" sx={{ fontSize: 11 }} />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title={entry.wentSpam ? "Clear spam flag" : "Mark as spam"}>
                      <IconButton size="small"
                        sx={{ color: entry.wentSpam ? "#ed6c02" : "#9e9e9e", "&:hover": { background: "#fff3e0" } }}
                        onClick={() => setConfirm({ type: "spam", ip: entry.ip, current: entry.wentSpam })}>
                        <ReportProblemOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove IP">
                      <IconButton size="small"
                        sx={{ color: "#e53935", "&:hover": { background: "#ffebee" } }}
                        onClick={() => setConfirm({ type: "delete", ip: entry.ip })}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {ips.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.disabled">No IPs configured for this server.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Add IP inline form */}
        <Collapse in={addOpen}>
          <Box sx={{ px: 3, py: 2, background: "#fff", borderTop: "1px dashed #e0e0e0" }}>
            <Typography variant="body2" fontWeight={600} mb={1.5}>New IP Entry</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
              <TextField label="IP Address" size="small" value={newIp.ip}
                onChange={(e) => setNewIp((p) => ({ ...p, ip: e.target.value }))} sx={{ flex: 1 }} />
              <TextField label="Provider" size="small" value={newIp.provider}
                onChange={(e) => setNewIp((p) => ({ ...p, provider: e.target.value }))} sx={{ flex: 1 }} />
              <FormControlLabel
                control={<Switch size="small" checked={newIp.isMainIp}
                  onChange={(e) => setNewIp((p) => ({ ...p, isMainIp: e.target.checked }))} />}
                label={<Typography variant="body2">Main IP</Typography>}
              />
            </Stack>
            <Stack direction="row" spacing={1} mt={2}>
              <Button variant="contained" size="small" onClick={handleAdd} disabled={saving} sx={{ textTransform: "none" }}>
                {saving ? <CircularProgress size={14} /> : "Save IP"}
              </Button>
              <Button variant="outlined" size="small" onClick={() => { setAddOpen(false); setNewIp(emptyIp()); }}
                sx={{ textTransform: "none" }}>Cancel</Button>
            </Stack>
          </Box>
        </Collapse>
      </Box>

      {/* Confirm: delete IP */}
      <ConfirmDialog
        open={confirm?.type === "delete"}
        title="Remove IP"
        message={<>Remove <strong style={{ fontFamily: "monospace" }}>{confirm?.ip}</strong> from this server? This cannot be undone.</>}
        confirmLabel="Remove"
        onConfirm={handleDeleteIp}
        onCancel={() => setConfirm(null)}
      />

      {/* Confirm: spam toggle */}
      <ConfirmDialog
        open={confirm?.type === "spam"}
        title={confirm?.current ? "Clear Spam Flag" : "Mark as Spam"}
        confirmColor="warning"
        message={
          confirm?.current
            ? <>Clear the spam flag on <strong style={{ fontFamily: "monospace" }}>{confirm?.ip}</strong>?</>
            : <>Mark <strong style={{ fontFamily: "monospace" }}>{confirm?.ip}</strong> as spam? This will affect campaign sending.</>
        }
        confirmLabel={confirm?.current ? "Clear Flag" : "Mark Spam"}
        onConfirm={handleToggleSpam}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ServerDomains: React.FC = () => {
  const [servers, setServers] = useState<ServerDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>
    ({ open: false, message: "", severity: "success" });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ServerDomain | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ServerDomain | null>(null);

  const showSnackbar = (message: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message, severity });

  const fetchServers = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/servers-domains");
      setServers(res.data.data);
    } catch { showSnackbar("Failed to load servers.", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchServers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => { setEditTarget(null); setForm(emptyForm()); setDialogOpen(true); };
  const openEdit = (s: ServerDomain) => {
    setEditTarget(s);
    setForm({ domain: s.domain, status: s.status, notes: s.notes ?? "", ips: [] });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.domain) { showSnackbar("Domain is required.", "error"); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await apiPut(`/servers-domains/${editTarget._id}`, { domain: form.domain, status: form.status, notes: form.notes });
        showSnackbar("Server domain updated.", "success");
      } else {
        await apiPost("/servers-domains", {
          domain: form.domain, status: form.status, notes: form.notes,
          availableIps: form.ips.filter((i) => i.ip && i.provider),
        });
        showSnackbar("Server domain created.", "success");
      }
      setDialogOpen(false);
      fetchServers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Operation failed.";
      showSnackbar(msg, "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/servers-domains/${deleteTarget._id}`);
      showSnackbar("Server domain deleted.", "success");
      setDeleteTarget(null);
      fetchServers();
    } catch { showSnackbar("Failed to delete.", "error"); }
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ background: "#e3f2fd", borderRadius: 2, p: 1, display: "flex" }}>
            <DnsIcon sx={{ color: "#1976d2", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} lineHeight={1.2}>Server Domains</Typography>
            <Typography variant="body2" color="text.secondary">
              {servers.length} server{servers.length !== 1 ? "s" : ""} configured
            </Typography>
          </Box>
        </Stack>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
          sx={{ textTransform: "none", borderRadius: 2, px: 2.5, fontWeight: 600 }}>
          Add Server
        </Button>
      </Stack>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#f8f9fa" }}>
                <TableCell sx={{ width: 48 }} />
                <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Domain</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>IPs</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Notes</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Created</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 13 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <DnsIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                    <Typography color="text.secondary">No servers configured yet.</Typography>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreate}
                      sx={{ mt: 2, textTransform: "none" }}>
                      Add your first server
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                servers.map((server) => {
                  const isExpanded = expanded === server._id;
                  const spamCount = server.availableIps.filter((i) => i.wentSpam).length;
                  return (
                    <React.Fragment key={server._id}>
                      <TableRow
                        sx={{
                          "&:hover": { background: "#f5f8ff" },
                          "& td": { borderBottom: isExpanded ? "none" : "1px solid #f0f0f0" },
                          cursor: "pointer",
                          background: isExpanded ? "#f5f8ff" : "inherit",
                        }}
                      >
                        {/* Expand */}
                        <TableCell sx={{ pr: 0 }}>
                          <IconButton size="small" onClick={() => setExpanded(isExpanded ? null : server._id)}>
                            {isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                          </IconButton>
                        </TableCell>

                        {/* Domain */}
                        <TableCell onClick={() => setExpanded(isExpanded ? null : server._id)}>
                          <Typography fontWeight={600} fontSize={14}>{server.domain}</Typography>
                        </TableCell>

                        {/* IPs */}
                        <TableCell onClick={() => setExpanded(isExpanded ? null : server._id)}>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <Chip label={`${server.availableIps.length} IP${server.availableIps.length !== 1 ? "s" : ""}`}
                              size="small" variant="outlined" sx={{ fontSize: 11 }} />
                            {spamCount > 0 && (
                              <Chip label={`${spamCount} spam`} size="small" color="error" sx={{ fontSize: 11 }} />
                            )}
                          </Stack>
                        </TableCell>

                        {/* Status */}
                        <TableCell onClick={() => setExpanded(isExpanded ? null : server._id)}>
                          <Chip
                            label={server.status === "active" ? "Active" : "Inactive"}
                            size="small"
                            color={server.status === "active" ? "success" : "default"}
                            variant={server.status === "active" ? "filled" : "outlined"}
                            sx={{ fontWeight: 600, fontSize: 11 }}
                          />
                        </TableCell>

                        {/* Notes */}
                        <TableCell onClick={() => setExpanded(isExpanded ? null : server._id)}
                          sx={{ maxWidth: 200 }}>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {server.notes || "—"}
                          </Typography>
                        </TableCell>

                        {/* Created */}
                        <TableCell onClick={() => setExpanded(isExpanded ? null : server._id)}>
                          <Typography variant="body2" color="text.secondary">
                            {server.createdAt
                              ? new Date(server.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
                              : "—"}
                          </Typography>
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => openEdit(server)}
                                sx={{ color: "#1976d2", "&:hover": { background: "#e3f2fd" } }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => setDeleteTarget(server)}
                                sx={{ color: "#e53935", "&:hover": { background: "#ffebee" } }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>

                      {/* Expanded IP panel */}
                      <TableRow>
                        <TableCell colSpan={7} sx={{ p: 0, borderBottom: isExpanded ? "1px solid #e0e0e0" : "none" }}>
                          <Collapse in={isExpanded} unmountOnExit>
                            <IpRows
                              serverId={server._id}
                              ips={server.availableIps}
                              onRefresh={fetchServers}
                              onSnackbar={showSnackbar}
                            />
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editTarget ? "Edit Server Domain" : "Add Server Domain"}</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="Domain" fullWidth size="small" value={form.domain}
              onChange={(e) => setForm((p) => ({ ...p, domain: e.target.value }))}
              placeholder="e.g. pingnotifier.org" />
            <TextField label="Status" select fullWidth size="small" value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as "active" | "inactive" }))}>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            <TextField label="Notes (optional)" fullWidth size="small" multiline rows={2} value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />

            {!editTarget && (
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="subtitle2" fontWeight={600}>IP Addresses</Typography>
                  <Button size="small" startIcon={<AddIcon />} sx={{ textTransform: "none" }}
                    onClick={() => setForm((p) => ({ ...p, ips: [...p.ips, emptyIp()] }))}>
                    Add IP
                  </Button>
                </Stack>
                <Stack spacing={1.5}>
                  {form.ips.map((ipEntry, idx) => (
                    <Stack key={idx} direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
                      <TextField label="IP Address" size="small" value={ipEntry.ip} sx={{ flex: 1 }}
                        onChange={(e) => setForm((p) => {
                          const ips = [...p.ips]; ips[idx] = { ...ips[idx], ip: e.target.value }; return { ...p, ips };
                        })} />
                      <TextField label="Provider" size="small" value={ipEntry.provider} sx={{ flex: 1 }}
                        onChange={(e) => setForm((p) => {
                          const ips = [...p.ips]; ips[idx] = { ...ips[idx], provider: e.target.value }; return { ...p, ips };
                        })} />
                      <FormControlLabel
                        control={<Switch size="small" checked={ipEntry.isMainIp}
                          onChange={(e) => setForm((p) => {
                            const ips = [...p.ips]; ips[idx] = { ...ips[idx], isMainIp: e.target.checked }; return { ...p, ips };
                          })} />}
                        label={<Typography variant="body2">Main</Typography>}
                      />
                      {form.ips.length > 1 && (
                        <IconButton size="small" color="error"
                          onClick={() => setForm((p) => ({ ...p, ips: p.ips.filter((_, i) => i !== idx) }))}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ textTransform: "none", minWidth: 90 }}>
            {saving ? <CircularProgress size={18} /> : editTarget ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Server Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Server Domain"
        message={<>Are you sure you want to delete <strong>{deleteTarget?.domain}</strong>? All associated IPs will be removed. This cannot be undone.</>}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServerDomains;
