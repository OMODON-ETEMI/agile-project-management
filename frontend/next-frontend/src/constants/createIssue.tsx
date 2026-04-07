"use client";

import { useState, useRef, useEffect, useMemo } from "react"; // Removed 'use' since it's not utilized
import { Issue, ISSUE_TYPES, IssueType, priority, Priority, priorityList, Status, StatusData, User, Board } from "../helpers/type"; // Added Board import
import { useAuth } from "../Authentication/authcontext";
import Icon from "../helpers/icon";
import useIssues from "../hooks/useIssues";

const colors = {
  textPrimary: "hsl(var(--foreground))",
  textSecondary: "hsl(var(--muted-foreground))",
  textMuted: "hsl(var(--muted-foreground))",
  border: "hsl(var(--border))",
  borderFocus: "hsl(var(--ring))",
  bg: "hsl(var(--secondary))",
  bgHover: "hsl(var(--accent))",
  bgInput: "hsl(var(--input))",
  bgInputHover: "hsl(var(--accent))",
  blue: "hsl(var(--primary))",
  blueHover: "hsl(var(--primary))",
  danger: "hsl(var(--destructive))",
  labelText: "hsl(var(--muted-foreground))",
};

const LINK_REASONS = [
  "Relates",
  "Blocks",
  "Is Blocked By",
  "Duplicate",
  "Is Duplicated By",
  "Clones",
  "Causes",
  "Depends On",
  "Is Depended On By",
];

const EPIC_COLORS = [
  "#0052CC", // Blue
  "#7A869A", // Slate
  "#36B37E", // Green
  "#FFAB00", // Yellow
  "#FF5630", // Red
  "#FF8B00", // Orange
  "#5243AA", // Purple
  "#00B8D9", // Teal
];

// --- SVG Icons ---
const ChevronDown = ({ size = 16, color = colors.textSecondary }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
    <path d="M4 6l4 4 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "hsl(var(--muted-foreground))" }}>
    <line x1="15" y1="5" x2="5" y2="15" />
    <line x1="5" y1="5" x2="15" y2="15" />
  </svg>
);

// --- Types ---
interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
}

interface FieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

interface CheckboxFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

interface AvatarProps {
  name: string;
}

interface JiraCreateIssueModalProps {
  users: User[];
  epics?: Issue[];
  boards?: Board[]; // Added new prop for boards
  /** Optional callback fired after the modal closes */
  onClose?: () => void;
  /** Optional callback fired after an issue is successfully created */
  onSubmit?: (data: Partial<Issue>) => Promise<any> | void;
}

// --- Dropdown ---
function Dropdown({ value, onChange, options }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o: DropdownOption) => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative" style={{ width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%",
          height: "32px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "0 8px",
          backgroundColor: open ? colors.bgHover : colors.bgInput,
          border: `1px solid ${open ? colors.borderFocus : colors.border}`,
          borderRadius: "3px",
          cursor: "pointer",
          fontSize: "14px",
          color: colors.textPrimary,
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { if (!open) e.currentTarget.style.backgroundColor = colors.bgInputHover; }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { if (!open) e.currentTarget.style.backgroundColor = colors.bgInput; }}
      >
        {selected?.icon && <span style={{ flexShrink: 0 }}>{selected.icon}</span>}
        <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected?.label}</span>
        <ChevronDown />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 1000,
            backgroundColor: "hsl(var(--popover))",
            border: `1px solid ${colors.border}`,
            borderRadius: "3px",
            boxShadow: "0 4px 8px -2px rgba(9,30,66,0.25), 0 0 0 1px rgba(9,30,66,0.08)",
            minWidth: "100%",
            maxHeight: "260px",
            overflowY: "auto",
          }}
        >
          {options.map((opt: DropdownOption) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                border: "none",
                background: opt.value === value ? "hsl(var(--accent))" : "transparent",
                cursor: "pointer",
                fontSize: "14px",
                color: colors.textPrimary,
                textAlign: "left",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { if (opt.value !== value) e.currentTarget.style.backgroundColor = colors.bgHover; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { if (opt.value !== value) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {opt.icon && <span style={{ flexShrink: 0 }}>{opt.icon}</span>}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Label ---
function FieldLabel({ children, required }: FieldLabelProps) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: "4px",
        fontSize: "12px",
        fontWeight: "600",
        color: colors.labelText,
        lineHeight: "1.3333",
        textTransform: "uppercase",
        letterSpacing: "0.03em",
      }}
    >
      {children}
      {required && <span style={{ color: colors.danger, marginLeft: "2px" }}>*</span>}
    </label>
  );
}

// --- Text Input ---
function TextInput({ value, onChange, placeholder, multiline, rows = 3 }: TextInputProps) {
  const [focused, setFocused] = useState(false);
  const baseStyle:  React.CSSProperties = {
    width: "100%",
    padding: "6px 8px",
    fontSize: "14px",
    color: colors.textPrimary,
    backgroundColor: focused ? "hsl(var(--background))" : colors.bgInput,
    border: `1px solid ${focused ? colors.borderFocus : colors.border}`,
    borderRadius: "3px",
    outline: "none",
    resize: multiline ? "vertical" : "none",
    transition: "border-color 0.15s, background-color 0.15s",
    boxSizing: "border-box",
    lineHeight: "1.4",
  };

  return multiline ? (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={baseStyle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  ) : (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={baseStyle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

// --- Assignee Avatar ---
function Avatar({ name }: AvatarProps) {
  const initials = name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";
  const hues: Record<string, number> = { "A": 210, "B": 140, "C": 270, "D": 30, "J": 190, "M": 340, "S": 70, "T": 15 };
  const h = hues[initials[0]] || 200;
  return (
    <div style={{
      width: "24px", height: "24px", borderRadius: "50%",
      background: `hsl(${h}, 60%, 50%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "10px", fontWeight: "700", color: "white", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// --- Checkbox Row ---
function CheckboxField({ checked, onChange, label }: CheckboxFieldProps) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ width: "14px", height: "14px", accentColor: colors.blue, cursor: "pointer" }}
      />
      <span style={{ fontSize: "14px", color: colors.textPrimary}}>{label}</span>
    </label>
  );
}

export default function JiraCreateIssueModal({ epics, users, boards, onClose, onSubmit }: JiraCreateIssueModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [epic, setEpic] = useState("");
  const [issuetype, setIssueType] = useState<IssueType>('Story');
  const [color, setColor] = useState("");
  const [status, setStatus] = useState<Status>("To Do");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reporter, setReporter] = useState("");
  const [assignees, setAssignees] = useState("unassigned");
  const [priority, setPriority] = useState<Priority>('Medium');
  const [board_id, setBoard_id] = useState("current");
  const [storyPoints, setStoryPoints] = useState<number>();
  const [parentIssue, setParentIssue] = useState("");
  const [linkReason, setLinkReason] = useState("Relates");
  const [createAnother, setCreateAnother] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (boards && boards.length > 0 && board_id === "current") setBoard_id(boards[0]._id);
  }, [boards, board_id]);

  const isEpic = issuetype === "Epic";
  const isSubtask = issuetype === "Sub-task";

  const { currentUser } = useAuth();
  const { issues } = useIssues({ workspaceId: epics ? epics[0]?.workspace_id : undefined, enable: !!epics });

  const issueTypeOptions = ISSUE_TYPES.map(t => ({ 
    value: t,
    label: t, 
    icon: <Icon isIssueType type={t.toLocaleLowerCase()} />
   }));

   const issueParent = useMemo(() =>[
    { value: "", label: "None" },
    ...issues.map(e => ({
      value: e._id as string,
      label: e.title
    }))
   ], [issues])

  const Epics = useMemo(() => [
    { value: "", label: "None" },
    ...(epics || []).map(e => ({ 
      value: e._id as string, 
      label: e.title 
    }))
  ], [epics]);

  // Memoized options for the Sprint dropdown
  const boardOptions = useMemo(() => [
    { value: "", label: "Select Sprint" }, 
    ...(boards || []).map(b => ({
      value: b._id,
      label: b.title
    }))
  ], [boards]);

const assigneeOptions = useMemo(() => {
  return [
    { value: "", label: "Unassigned" },
    { 
      value: currentUser?.user_id as string, 
      label: "Assign to me",
      icon: currentUser ? (
        <Avatar 
          name={`${currentUser.firstname} ${currentUser.lastname}`} 
        />
      ) : <>Loading...</>
    },
    ...users
      .filter(u => u._id !== currentUser?.user_id)
      .map((user) => ({
        value: user._id as string,
        label: `${user.firstname} ${user.lastname}`,
        icon: (
          <Avatar 
            name={`${user.firstname} ${user.lastname}`} 
          />
        ),
      })),
  ];
    }, [users, currentUser]);


  const reporterOptions = useMemo(() => {
    return assigneeOptions.filter(o => o.value !== "unassigned").map(opt => {
      if (opt.value === currentUser?.user_id){
        return {...opt, label: "ME (Default)"}
      }
      return opt
    })
  }, [assigneeOptions, currentUser])

  const priorityOptions = priorityList.map(p => ({ 
    value: p, 
    label: p, 
    icon: <Icon isPriority type={p.toLocaleLowerCase()} />
  }));

  const linkReasonOptions = LINK_REASONS.map(r => ({ value: r, label: r }));

   const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Summary is required.";
    
    if (isSubtask && !parentIssue) {
      e.parentIssue = "Sub-tasks must be linked to a parent issue.";
    }
    
    if (isSubtask && !linkReason) {
      e.linkReason = "A link reason is required for sub-tasks.";
    }

    if (!isEpic && !board_id) { // Sprint is compulsory for non-epic issues
      e.board_id = "Sprint is required.";
    }

    if (!reporter) e.reporter = "Reporter is required.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setIsSubmitting(true);

    try {
      const finalColor = isEpic ? (color || EPIC_COLORS[Math.floor(Math.random() * EPIC_COLORS.length)]) : undefined;

      const data: Partial<Issue> = isEpic ? { // For Epics, board_id should be undefined
        issuetype, title, description, reporter, board_id: undefined, 
        status: "Backlog", priority: "Medium", storyPoints: 0, assignees: undefined,
        color: finalColor
      } : {
        epic: isSubtask ? undefined : (epic || null),
        parent: isSubtask ? parentIssue : undefined,
        linkedIssues: isSubtask ? [{ issue: parentIssue as any, type: linkReason as any }] : [],
        issuetype, status, title, description, reporter, assignees, priority, board_id, storyPoints
      };
      await onSubmit?.(data);
      
      setSubmitted(true);
      setIsSubmitting(false);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(false);
      if (!createAnother) {
        setIsOpen(false);
        onClose?.();
      } else {
        // Reset form for next entry
        setTitle(""); setDescription(""); setStoryPoints(0);
        setAssignees("unassigned"); setPriority('Medium'); setColor("");
        setBoard_id(boards && boards.length > 0 ? boards[0]._id : "current");
      }
    } catch (err) {
      setIsSubmitting(false);
      // On error, the modal remains open and onClose is not triggered
    }
  };

  const handleClose = () => { setErrors({}); setIsOpen(false); onClose?.(); };

  if (!isOpen) return (
    <button
      onClick={() => setIsOpen(true)}
      className="w-full px-4 py-3 text-sm text-foreground hover:bg-muted/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary text-left flex items-center gap-2"
    >
      <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Create Issue
    </button>
  );

  return (
    <div style={{ 
      position: "fixed", 
      inset: 0, 
      zIndex: 100, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      backdropFilter: "blur(2px)",
      }}>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.65)"}}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "580px",
          maxHeight: "90vh",
          backgroundColor: "hsl(var(--background))",
          opacity: 1,
          borderRadius: "3px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 16px",
          borderBottom: `1px solid ${colors.border}`,
          flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: colors.textPrimary, lineHeight: "1.2" }}>
            Create issue
          </h2>
          <button
            onClick={handleClose}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "32px", height: "32px", border: "none", background: "transparent",
              borderRadius: "3px", cursor: "pointer", padding: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.bgHover}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>

          {/* Project */}
          {!isEpic && (
            <div style={{ marginBottom: "16px" }}>
              <FieldLabel>Parent Epic</FieldLabel>
              <Dropdown value={epic} onChange={setEpic} options={Epics} />
            </div>
          )}

          {/* Issue Type */}
          <div style={{ marginBottom: "16px" }}>
            <FieldLabel required>Issue Type</FieldLabel>
            <Dropdown value={issuetype} onChange={(val: string) => setIssueType(val as IssueType)} options={issueTypeOptions} />
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: colors.textMuted, lineHeight: "1.4" }}>
              Start typing to get a list of possible matches.
            </p>
          </div>

          {/* Epic Color Picker */}
          {isEpic && (
            <div style={{ marginBottom: "16px" }}>
              <FieldLabel>Epic Color</FieldLabel>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                {EPIC_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "3px",
                      backgroundColor: c,
                      border: color === c ? `2px solid ${colors.textPrimary}` : "2px solid transparent",
                      cursor: "pointer",
                      transition: "transform 0.1s",
                      boxSizing: "border-box"
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Thin divider */}
          <hr style={{ border: "none", borderTop: `1px solid ${colors.border}`, margin: "4px 0 16px" }} />

          {/* Sub-task Linking */}
          {isSubtask && (
            <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "hsl(var(--muted) / 0.3)", borderRadius: "4px", border: `1px solid ${colors.border}` }}>
               <div style={{ marginBottom: "12px" }}>
                <FieldLabel required>Link to Parent (Story or Task)</FieldLabel>
                <Dropdown value={parentIssue} onChange={setParentIssue} options={issueParent} />
                {errors.parentIssue && (
                  <p style={{ margin: "4px 0 0", fontSize: "11px", color: colors.danger }}>{errors.parentIssue}</p>
                )}
              </div>
              <div>
                <FieldLabel required>Link Reason</FieldLabel>
                <Dropdown value={linkReason} onChange={setLinkReason} options={linkReasonOptions} />
                {errors.linkReason && (
                  <p style={{ margin: "4px 0 0", fontSize: "11px", color: colors.danger }}>{errors.linkReason}</p>
                )}
              </div>
            </div>
          )}

          {/* Status */}
          {!isEpic && (
            <div style={{ marginBottom: "16px" }}>
              <FieldLabel>Status</FieldLabel>
              <Dropdown value={status} onChange={(val: string) => setStatus(val as Status)} options={StatusData.map(s => ({ value: s, label: s }))} />
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: colors.textMuted, lineHeight: "1.4" }}>
                This is the initial status upon creation.
              </p>
            </div>
          )}

          {/* Sprint */}
          {!isEpic && (
            <div style={{ marginBottom: "16px" }}>
              <FieldLabel required>Sprint</FieldLabel>
              <Dropdown value={board_id} onChange={setBoard_id} options={boardOptions} />
              {errors.board_id && (
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: colors.danger }}>{errors.board_id}</p>
              )}
            </div>
          )}

          {/* Summary */}
          <div style={{ marginBottom: "16px" }}>
            <FieldLabel required>Summary</FieldLabel>
            <TextInput
              value={title}
              onChange={v => { setTitle(v); if (v.trim()) setErrors(e => ({ ...e, summary: undefined })); }}
              placeholder=""
            />
            {errors.title && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: colors.danger }}>{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: "16px" }}>
            <FieldLabel>Description</FieldLabel>
            {/* Toolbar */}
            <div style={{
              border: `1px solid ${colors.border}`,
              borderBottom: "none",
              borderRadius: "3px 3px 0 0",
              padding: "4px 6px",
              display: "flex",
              gap: "2px",
              backgroundColor: colors.bgInput,
            }}>
              {["B", "I", "U", "—", "≡", '""', "⊞", "∞", "@"].map((t, i) => (
                <button key={i} type="button" style={{
                  width: "26px", height: "24px", border: "none", background: "transparent",
                  borderRadius: "2px", cursor: "pointer", fontSize: t.length === 1 ? "13px" : "11px",
                  color: colors.textSecondary, display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: t === "B" ? "700" : t === "I" ? "400" : "400",
                  fontStyle: t === "I" ? "italic" : "normal",
                }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.bgHover}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >{t}</button>
              ))}
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the issue…"
              rows={5}
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "14px",
                color: colors.textPrimary,
                backgroundColor: "hsl(var(--background))",
                border: `1px solid ${colors.border}`,
                borderRadius: "0 0 3px 3px",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                lineHeight: "1.5",
              }}
              onFocus={e => e.target.style.borderColor = colors.borderFocus}
              onBlur={e => e.target.style.borderColor = colors.border}
            />
          </div>

          {/* Assignee */}
          {!isEpic && (
            <div style={{ marginBottom: "16px" }}>
              <FieldLabel>Assignee</FieldLabel>
              <Dropdown value={assignees} onChange={setAssignees} options={assigneeOptions} />
              <button
                type="button"
                style={{ marginTop: "4px", border: "none", background: "none", padding: 0, fontSize: "12px", color: colors.blue, cursor: "pointer"}}
                onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                onClick={() => setAssignees(currentUser?.user_id || "unassigned")}
              >
                Assign to me
              </button>
            </div>
          )}

          {/* Reporter */}
          <div style={{ marginBottom: "16px" }}>
            <FieldLabel required>Reporter</FieldLabel>
            <Dropdown value={reporter} onChange={setReporter} options={reporterOptions} />
            {errors.reporter && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: colors.danger }}>{errors.reporter}</p>
            )}
          </div>

          {/* Priority */}
          {!isEpic && (
            <div style={{ marginBottom: "16px" }}>
              <FieldLabel>Priority</FieldLabel>
              <Dropdown value={priority} onChange={(val:string) => setPriority(val as Priority)} options={priorityOptions} />
            </div>
          )}

          {/* Story Points */}
          {!isEpic && (
            <div style={{ marginBottom: "16px" }}>
              <FieldLabel>Story Points</FieldLabel>
              <input
                type="number"
                min="0"
                max="100"
                value={storyPoints}
                onChange={e => setStoryPoints(Number(e.target.value))}
                placeholder="None"
                style={{
                  width: "100%",
                  height: "32px",
                  padding: "0 8px",
                  fontSize: "14px",
                  color: colors.textPrimary,
                  backgroundColor: colors.bgInput,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "3px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={e => { e.target.style.borderColor = colors.borderFocus; e.target.style.backgroundColor = "hsl(var(--background))"; }}
                onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.backgroundColor = colors.bgInput; }}
              />
            </div>
          )}

          {/* Attachment area */}
          <div style={{ marginBottom: "8px" }}>
            <FieldLabel>Attachment (Disabled for now)</FieldLabel>
            <div style={{
              border: `1px dashed ${colors.border}`,
              borderRadius: "3px",
              padding: "16px",
              textAlign: "center",
              backgroundColor: colors.bgInput,
              cursor: "pointer",
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.bgHover}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = colors.bgInput}
            >
              <p style={{ margin: 0, fontSize: "14px", color: colors.textMuted }}>
                Drop files to attach, or{" "}
                <span style={{ color: colors.blue, cursor: "pointer" }}>browse</span>
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderTop: `1px solid ${colors.border}`,
          flexShrink: 0,
          backgroundColor: "hsl(var(--card))",
        }}>
          <CheckboxField
            checked={createAnother}
            onChange={setCreateAnother}
            label="Create another"
          />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                height: "32px", padding: "0 12px",
                border: "none", background: "transparent",
                borderRadius: "3px", cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500", color: colors.textSecondary,
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.bgHover; e.currentTarget.style.color = colors.textPrimary; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = colors.textSecondary; }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting || submitted}
              onClick={handleSubmit}
              style={{
                height: "32px", padding: "0 12px",
                border: "1px solid hsl(var(--primary))",
                backgroundColor: submitted ? "#22c55e" : (isSubmitting ? "hsl(var(--muted))" : "hsl(var(--primary))"),
                borderRadius: "3px", cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600", color: "var(--primary-foreground)",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: "6px",
              }}
              onMouseEnter={e => {
                if (!submitted && !isSubmitting) e.currentTarget.style.backgroundColor = colors.bgHover;
              }}
              onMouseLeave={e => {
                if (!submitted && !isSubmitting) e.currentTarget.style.backgroundColor = "hsl(var(--primary))";
              }}
            >
              {isSubmitting ? "Creating..." : submitted ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5 6.5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Created!
                </>
              ) : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}