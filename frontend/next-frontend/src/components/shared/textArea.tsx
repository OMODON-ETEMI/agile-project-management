import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import  Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import { User } from "../helpers/type";


interface TextAreaProps {
  users: User[];
  onChange?: (html: string, plaintext:string) => void;
  maxLength: 1000;
}

export default function TextArea({ users, onChange, maxLength }: TextAreaProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Type @ to mention a teammate and notify them about this issue...',
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline cursor-pointer',
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'inline-flex items-center rounded bg-blue-50 px-2 py-1 text-sm text-blue-600 hover:bg-blue-100 transition-colors',
        },
        suggestion: {
          items: ({ query }) => {
            return users.filter((user) => user.username.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5);
          },
          render: () => {
            let component: HTMLElement;
            let popup: any;
            let selectedIndex = 0;
            let currentUsers: User[] = [];
            let globalProps: any = {};

            return {
              onStart: (props: any) => {
                console.log('onStart:', props);
                globalProps = props;
                currentUsers = props.items;
                component = document.createElement('div')
                component.className = 'max-h-[200px] overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-100 py-1';
                component.style.pointerEvents = "auto"; // Enable interactions


                const items = currentUsers.map((item: User, index: number) => {
                  const div = document.createElement('div');
                  div.style.pointerEvents = "auto"; // Enable interactions
                  div.className = 'flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors';
                  div.setAttribute('data-index', String(index));

                  // Create avatar element
                  const avatar = document.createElement('div');
                  avatar.className = 'w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium';
                  avatar.textContent = item.username.charAt(0).toUpperCase();

                  // Create text container
                  const textContainer = document.createElement('div');
                  textContainer.className = 'flex flex-col';

                  // Add username
                  const username = document.createElement('div');
                  username.className = 'text-sm font-medium text-gray-700';
                  username.textContent = item.username;

                  // Assemble the elements
                  textContainer.appendChild(username);
                  div.appendChild(avatar);
                  div.appendChild(textContainer);

                  return div;
                });

                items.forEach(item => {
                  component.appendChild(item);
                });

                component.addEventListener('mousedown', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const target = e.target as HTMLElement;
                  const index = target.getAttribute('data-index');

                  if (index !== null) {
                    const user = currentUsers[parseInt(index)];
                    globalProps.command({ id: user._id, label: user.username });
                  }
                });

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  allowHTML: true,
                  placement: 'top-start',
                  offset: [0, 8],
                  onMount(instance) {
                    // Prevent clicks inside tippy from bubbling
                    instance.popper.addEventListener('click', (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    });
                  },
                })[0];
              },

              onKeyDown(props: any) {
                console.log('onKeyDown:', props);
                if (props.event.key === 'Enter') {
                  if (currentUsers && currentUsers.length > 0) {
                    globalProps.command({ id: currentUsers[selectedIndex]._id, label: currentUsers[selectedIndex].username });
                    return true;
                  }
                }
                return false;
              },
              onExit() {
                if (popup && !popup.state.isDestroyed) {
                  popup.destroy();
                }
                popup = null;
                currentUsers = [];
                selectedIndex = 0;
              },
            }
          }
        }
      })
    ],
    content: '',
    onUpdate({editor}) {
      const html = editor.getHTML();
      const plaintext = editor.getText();
      if (plaintext.length <= maxLength && onChange) {
        onChange(html, plaintext);
      }
    }

  })

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 p-2 bg-gray-50">
         <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
          title="Heading"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M13.23 15h-2.46L9.57 16.92c-.13.23-.23.4-.31.51-.08.11-.19.21-.34.31s-.32.17-.51.23c-.19.06-.41.09-.67.09-.07 0-.15-.01-.23-.02-.08-.01-.21-.04-.4-.09v-1.38c.06.02.12.04.18.06.06.02.12.02.17.02.19 0 .34-.06.46-.17.12-.11.25-.29.4-.54l4.01-7.64c.11-.21.22-.37.33-.48.11-.11.26-.2.44-.26.18-.06.41-.09.69-.09s.51.03.69.09c.18.06.33.15.44.26.11.11.22.27.33.48l4.01 7.64c.15.26.28.44.4.54.12.11.27.17.46.17.05 0 .1 0 .17-.02.07-.02.12-.04.18-.06v1.38c-.19.05-.33.08-.4.09-.07.01-.15.02-.23.02-.26 0-.48-.03-.67-.09s-.37-.13-.51-.23-.26-.2-.34-.31-.18-.28-.31-.51L13.23 15zm1.23-5.34l-1.35 3.69h2.71l-1.36-3.69z"/>
          </svg>
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('bold') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M8 11h4.5a2.5 2.5 0 0 0 0-5H8v5Zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.613A4.5 4.5 0 0 1 18 15.5ZM8 13v5h5.5a2.5 2.5 0 0 0 0-5H8Z" />
          </svg>
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('italic') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15v2Z" />
          </svg>
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor?.isActive('strike') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
          title="Strikethrough"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M17.154 14c.23.516.346 1.09.346 1.72 0 1.342-.524 2.392-1.571 3.147C14.88 19.622 13.433 20 11.586 20c-1.64 0-3.263-.381-4.87-1.144V16.6c1.52.877 3.075 1.316 4.666 1.316 2.551 0 3.83-.732 3.839-2.197a2.21 2.21 0 0 0-.648-1.603l-.12-.117H3v-2h18v2h-3.846zm-4.078-3H7.629a4.086 4.086 0 0 1-.481-.522C6.716 9.92 6.5 9.246 6.5 8.452c0-1.236.466-2.287 1.397-3.153C8.83 4.433 10.271 4 12.222 4c1.471 0 2.879.328 4.222.984v2.152c-1.2-.687-2.515-1.03-3.946-1.03-2.48 0-3.719.782-3.719 2.346 0 .42.218.786.654 1.099.436.313.974.562 1.613.75.62.18 1.297.414 2.03.699z"/>
          </svg>
        </button>
         <button
          onClick={() => editor?.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor?.isActive('code') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
          title="Inline Code"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M8.293 6.293 2.586 12l5.707 5.707 1.414-1.414L5.414 12l4.293-4.293zm7.414 11.414L21.414 12l-5.707-5.707-1.414 1.414L18.586 12l-4.293 4.293z"/>
          </svg>
        </button>
        <div className="h-4 w-px bg-gray-300" /> 
        {/* Divider */}
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('bulletList') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M8 4h13v2H8V4ZM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM8 11h13v2H8v-2Zm0 7h13v2H8v-2Z" />
          </svg>
        </button>
         <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor?.isActive('orderedList') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
          title="Numbered List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M8 4h13v2H8V4ZM5 3v3h1v1H3V6h1V4H3V3h2zm-2 7h3.5v1H3v-1zm2 3h1v1H3v-3h2v1zm-2 4h2.5v1H3v-1zm2 3h1v1H3v-3h2v1zm5-9h13v2H8v-2zm0 7h13v2H8v-2z"/>
          </svg>
        </button>
         {/* Insert */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            const url = window.prompt('Enter link URL:')
            if (url) {
              editor?.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor?.isActive('link') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
          title="Insert Link"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636l1.415-1.414a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z"/>
          </svg>
        </button>
        <label className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600 cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                // Handle file upload here
                console.log('File selected:', file)
              }
            }}
          />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M14 14.252V22H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11.17c.413 0 .81.164 1.101.456l3.272 3.272a1.56 1.56 0 0 1 .457 1.1V9h-2V7.242L15.758 5H4v15h8v-5.748h2zm3.617-1.252h4.765a.6.6 0 0 1 .6.6v1.8a.6.6 0 0 1-.6.6h-4.765l1.2 1.2a.6.6 0 0 1 0 .85l-1.272 1.271a.6.6 0 0 1-.85 0L12 14.13l4.695-4.695a.6.6 0 0 1 .85 0l1.272 1.272a.6.6 0 0 1 0 .85l-1.2 1.2z"/>
          </svg>
        </label>
      </div>
      </div>

      {/* Editor Content */}
      <div className="p-4">
        <EditorContent
          editor={editor}
          className="prose max-w-none focus:outline-none"
        />
      </div>
    </div>
  );
}