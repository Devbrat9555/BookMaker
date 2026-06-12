import { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Node } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Blockquote from '@tiptap/extension-blockquote';
import CharacterCount from '@tiptap/extension-character-count';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { useReactToPrint } from 'react-to-print';
import { 
  Printer, Bold, Italic, Strikethrough, Underline as UnderlineIcon,
  Superscript as SuperscriptIcon, Subscript as SubscriptIcon,
  List, ListOrdered, Heading1, Heading2, Heading3, 
  Image as ImageIcon, Minus, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo, Table as TableIcon, Palette, Type, Save, Scissors, AlertTriangle, CheckCircle, Info, Sigma, FileText, Plus, Eraser, Maximize, Minimize, Moon, Sun, Grid, FileOutput, Search, BookOpen, Layers
} from 'lucide-react';
import './index.css';

const CustomHorizontalRule = HorizontalRule.extend({
  addAttributes() {
    return {
      color: {
        default: '#e5e7eb',
        parseHTML: element => element.style.borderColor,
        renderHTML: attributes => {
          if (!attributes.color) return {};
          return { style: `border-color: ${attributes.color} !important; border-top-width: 2px;` };
        },
      },
    };
  },
});

const CustomBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.class) return {};
          return { class: attributes.class };
        },
      },
    };
  },
});

const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  parseHTML() { return [{ tag: 'div.page-break' }]; },
  renderHTML() { return ['div', { class: 'page-break' }]; },
  addCommands() {
    return {
      setPageBreak: () => ({ chain }) => {
        return chain().insertContent({ type: this.name }).run();
      },
    };
  },
});

const TOCBlock = Node.create({
  name: 'tocBlock',
  group: 'block',
  atom: true,
  parseHTML() { return [{ tag: 'div.toc-block' }]; },
  renderHTML() { return ['div', { class: 'toc-block' }, '1. Introduction .................... 1\n2. Chapter One .................... 5\n3. Chapter Two .................... 12']; },
});

const RibbonMenu = ({ editor, activeTab, settings, setSettings, toggleDropcap, openFindReplace }) => {
  const [lineColor, setLineColor] = useState('#3b82f6');

  if (!editor) return null;

  const insertBox = (type, text) => {
    editor.chain().focus().insertContent(`<blockquote class="${type}"><p><strong>${text}</strong><br/>यहाँ अपना टेक्स्ट लिखें...</p></blockquote><p></p>`).run();
  };

  const insertCover = () => {
    editor.chain().focus().insertContent(`<div style="text-align: center; padding: 100px 20px;"><h1 style="font-size: 48px; color: #1e3a8a; border: none; background: transparent;">BOOK TITLE</h1><p style="font-size: 24px; color: #64748b;">Author Name</p></div><div class="page-break"></div>`).run();
  };

  const insertEquation = () => {
    editor.chain().focus().insertContent(`<pre><code>x = (-b ± √(b² - 4ac)) / 2a\n\n∑ (i=1 to n) i = n(n+1)/2</code></pre><p></p>`).run();
  };

  const clearFormatting = () => {
    // Advanced eraser: clears nodes and removes class attributes if possible
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 shadow-sm z-20 flex gap-6 overflow-x-auto custom-scrollbar no-print">
      
      {activeTab === 'home' && (
        <>
          <div className="flex flex-col gap-1 border-r border-gray-200 pr-4 shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-400">History</span>
            <div className="flex gap-1">
              <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30"><Undo size={16} /></button>
              <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30"><Redo size={16} /></button>
            </div>
          </div>

          <div className="flex flex-col gap-1 border-r border-gray-200 pr-4 shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-400">Font</span>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1 items-center">
                <select onChange={e => editor.chain().focus().setFontFamily(e.target.value).run()} value={editor.getAttributes('textStyle').fontFamily || ''} className="border border-gray-300 rounded px-1 py-0.5 text-xs w-28">
                  <option value="">Default Font</option>
                  <option value="Inter, sans-serif">Modern</option>
                  <option value="Georgia, serif">Classic</option>
                  <option value="'Noto Sans Devanagari', sans-serif">Hindi</option>
                  <option value="'Courier New', Courier, monospace">Code</option>
                </select>
                <button onClick={clearFormatting} className="p-1 rounded text-red-500 hover:bg-red-50" title="Clear Formatting"><Eraser size={14} /></button>
              </div>
              <div className="flex gap-1 items-center bg-slate-50 rounded px-1">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1 rounded ${editor.isActive('bold') ? 'bg-slate-300' : 'hover:bg-slate-200'}`}><Bold size={14} /></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1 rounded ${editor.isActive('italic') ? 'bg-slate-300' : 'hover:bg-slate-200'}`}><Italic size={14} /></button>
                <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1 rounded ${editor.isActive('underline') ? 'bg-slate-300' : 'hover:bg-slate-200'}`}><UnderlineIcon size={14} /></button>
                <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-1 rounded ${editor.isActive('strike') ? 'bg-slate-300' : 'hover:bg-slate-200'}`}><Strikethrough size={14} /></button>
                <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={`p-1 rounded ${editor.isActive('subscript') ? 'bg-slate-300' : 'hover:bg-slate-200'}`}><SubscriptIcon size={14} /></button>
                <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={`p-1 rounded ${editor.isActive('superscript') ? 'bg-slate-300' : 'hover:bg-slate-200'}`}><SuperscriptIcon size={14} /></button>
                
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <input type="color" onInput={e => editor.chain().focus().setColor(e.target.value).run()} value={editor.getAttributes('textStyle').color || '#000000'} className="w-5 h-5 p-0 border-0 rounded cursor-pointer" title="Text Color"/>
                <input type="color" onInput={e => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()} value={editor.isActive('highlight') ? editor.getAttributes('highlight').color : '#ffff00'} className="w-5 h-5 p-0 border-0 rounded cursor-pointer" title="Highlight Color"/>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 border-r border-gray-200 pr-4 shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-400">Paragraph</span>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1 bg-slate-50 rounded px-1">
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-300' : 'hover:bg-slate-200'}`}><Heading1 size={14} /></button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-300' : 'hover:bg-slate-200'}`}><Heading2 size={14} /></button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-1 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-300' : 'hover:bg-slate-200'}`}><Heading3 size={14} /></button>
              </div>
              <div className="flex gap-1 bg-slate-50 rounded px-1">
                <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-300' : 'hover:bg-slate-200'}`}><AlignLeft size={14} /></button>
                <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-300' : 'hover:bg-slate-200'}`}><AlignCenter size={14} /></button>
                <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-300' : 'hover:bg-slate-200'}`}><AlignRight size={14} /></button>
                <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-1 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-300' : 'hover:bg-slate-200'}`}><AlignJustify size={14} /></button>
                <div className="w-px h-4 bg-gray-300 mx-1 mt-1"></div>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-slate-300' : 'hover:bg-slate-200'}`}><List size={14} /></button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-slate-300' : 'hover:bg-slate-200'}`}><ListOrdered size={14} /></button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 pr-4 shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-400">Editing</span>
            <button onClick={openFindReplace} className="flex items-center gap-1 p-1 rounded hover:bg-slate-100 text-xs font-semibold"><Search size={14}/> Find / Replace</button>
          </div>
        </>
      )}

      {activeTab === 'insert' && (
        <>
          <div className="flex flex-col gap-1 border-r border-gray-200 pr-4 shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-400">Pages & Tables</span>
            <div className="flex gap-2">
              <button onClick={() => editor.chain().focus().setPageBreak().run()} className="flex flex-col items-center p-1 rounded hover:bg-slate-100 text-blue-600"><Scissors size={20}/><span className="text-[9px] mt-1 font-bold">Page Break</span></button>
              <button onClick={insertCover} className="flex flex-col items-center p-1 rounded hover:bg-slate-100 text-indigo-600"><BookOpen size={20}/><span className="text-[9px] mt-1 font-bold">Cover Page</span></button>
              <button onClick={() => editor.chain().focus().insertContent('<div class="toc-block"></div><p></p>').run()} className="flex flex-col items-center p-1 rounded hover:bg-slate-100 text-emerald-600"><Layers size={20}/><span className="text-[9px] mt-1 font-bold">Index (TOC)</span></button>
              <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="flex flex-col items-center p-1 rounded hover:bg-slate-100 text-gray-700"><TableIcon size={20}/><span className="text-[9px] mt-1 font-bold">Table</span></button>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 border-r border-gray-200 pr-4 shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-400">Media & Rules</span>
            <div className="flex gap-2 items-center">
              <button onClick={() => { const url = window.prompt('URL:'); if (url) editor.chain().focus().setImage({ src: url }).run(); }} className="p-1.5 rounded hover:bg-slate-100"><ImageIcon size={18} /></button>
              <div className="flex items-center gap-1 border border-gray-200 rounded p-0.5">
                <input type="color" value={lineColor} onChange={e => setLineColor(e.target.value)} className="w-5 h-5 p-0 border-0 rounded cursor-pointer" />
                <button onClick={() => editor.chain().focus().setHorizontalRule({ color: lineColor }).run()} className="p-1 rounded hover:bg-slate-100"><Minus size={18} /></button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 pr-4 shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-400">Professional Blocks</span>
            <div className="flex flex-wrap gap-1 items-center">
              <select 
                onChange={(e) => {
                  if (e.target.value) {
                    const [type, text] = e.target.value.split('|');
                    insertBox(type, text);
                    e.target.value = ''; // Reset
                  }
                }}
                className="px-2 py-0.5 rounded text-indigo-700 bg-indigo-50 text-xs font-bold border border-indigo-200 outline-none cursor-pointer"
              >
                <option value="">+ Insert Book Box...</option>
                <optgroup label="Questions & Exercises">
                  <option value="question|प्रश्न (Question)">Question Box</option>
                  <option value="exercise|प्रश्नावली (Exercise)">Exercise Box</option>
                  <option value="solution|हल (Solution)">Solution Box</option>
                </optgroup>
                <optgroup label="Theorems & Concepts">
                  <option value="theorem|प्रमेय (Theorem)">Theorem Box</option>
                  <option value="formula|महत्वपूर्ण सूत्र (Important Formula)">Formula Box</option>
                  <option value="blue|परिभाषा (Definition)">Definition Box</option>
                </optgroup>
                <optgroup label="Notes & Hints">
                  <option value="hint|संकेत (Hint / Tip)">Hint Box</option>
                  <option value="success|याद रखें (Key Point)">Key Point Box</option>
                  <option value="info|जानकारी (Info)">Info Box</option>
                  <option value="warning|चेतावनी (Warning)">Warning Box</option>
                </optgroup>
                <optgroup label="Chapter Elements">
                  <option value="summary|सारांश (Summary)">Chapter Summary</option>
                </optgroup>
              </select>
              <button onClick={insertEquation} className="px-2 py-0.5 rounded text-purple-700 bg-purple-50 text-xs font-bold border border-purple-200 flex items-center gap-1 hover:bg-purple-100"><Sigma size={12}/> Math Eq.</button>
              <button onClick={toggleDropcap} className="px-2 py-0.5 rounded text-slate-700 bg-slate-100 text-xs font-bold border border-slate-300 hover:bg-slate-200">Dropcap</button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'layout' && (
        <>
          <div className="flex flex-col gap-1 border-r border-gray-200 pr-4 shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-400">Page Margins</span>
            <div className="flex gap-1 bg-slate-50 rounded p-1">
              <button onClick={() => setSettings({...settings, margin: 'normal'})} className={`px-2 py-1 text-xs rounded ${settings.margin === 'normal' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200'}`}>Normal</button>
              <button onClick={() => setSettings({...settings, margin: 'narrow'})} className={`px-2 py-1 text-xs rounded ${settings.margin === 'narrow' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200'}`}>Narrow</button>
              <button onClick={() => setSettings({...settings, margin: 'wide'})} className={`px-2 py-1 text-xs rounded ${settings.margin === 'wide' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200'}`}>Wide</button>
            </div>
          </div>
          <div className="flex flex-col gap-1 border-r border-gray-200 pr-4 shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-400">Page Color</span>
            <div className="flex gap-1 bg-slate-50 rounded p-1">
              <button onClick={() => setSettings({...settings, pageBg: 'white'})} className={`w-6 h-6 rounded-full border-2 ${settings.pageBg === 'white' ? 'border-blue-600' : 'border-gray-300'} bg-white`} title="White"></button>
              <button onClick={() => setSettings({...settings, pageBg: 'sepia'})} className={`w-6 h-6 rounded-full border-2 ${settings.pageBg === 'sepia' ? 'border-blue-600' : 'border-gray-300'} bg-[#fef0d9]`} title="Sepia"></button>
              <button onClick={() => setSettings({...settings, pageBg: 'gray'})} className={`w-6 h-6 rounded-full border-2 ${settings.pageBg === 'gray' ? 'border-blue-600' : 'border-gray-300'} bg-slate-100`} title="Gray"></button>
            </div>
          </div>
          <div className="flex flex-col gap-1 pr-4 shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-400">Watermark</span>
            <input type="text" placeholder="e.g. DRAFT" value={settings.watermark} onChange={(e) => setSettings({...settings, watermark: e.target.value})} className="border border-gray-300 rounded px-2 py-1 text-xs w-32 outline-none focus:border-blue-500" />
          </div>
        </>
      )}

      {activeTab === 'view' && (
        <>
          <div className="flex flex-col gap-1 border-r border-gray-200 pr-4 shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-400">Workspace Theme</span>
            <button onClick={() => setSettings({...settings, darkMode: !settings.darkMode})} className="flex items-center gap-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-bold transition-all">
              {settings.darkMode ? <Sun size={14}/> : <Moon size={14}/>}
              {settings.darkMode ? "Light Studio" : "Dark Studio"}
            </button>
          </div>
          <div className="flex flex-col gap-1 pr-4 shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-400">Gridlines</span>
            <button onClick={() => setSettings({...settings, gridlines: !settings.gridlines})} className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-all ${settings.gridlines ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
              <Grid size={14}/> {settings.gridlines ? 'Hide Gridlines' : 'Show Gridlines'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

function App() {
  const defaultHTML = `
    <h6>Class 9 Mathematics — Devbrat Yadav | अध्याय 1: संख्या पद्धति</h6>
    <hr />
    <h1>अध्याय 1: संख्या पद्धति<br/>Number Systems</h1>
    <h2>1.1 भूमिका (Introduction)</h2>
    <p>पिछली कक्षाओं में, आप संख्या रेखा के बारे में पढ़ चुके हैं और यह भी जान चुके हैं कि विभिन्न प्रकार की संख्याओं को संख्या रेखा पर किस प्रकार निरूपित किया जाता है।</p>
    <div class="page-break"></div>
    <h2>1.2 परिमेय संख्याएँ</h2>
    <blockquote class="blue"><p><strong>परिभाषा: परिमेय संख्याएँ</strong><br/>संख्या 'r' को परिमेय संख्या कहा जाता है, यदि इसे p/q के रूप में लिखा जा सके...</p></blockquote>
  `;

  const [activeTab, setActiveTab] = useState('home');
  const [zoom, setZoom] = useState(100);
  const [fullScreen, setFullScreen] = useState(false);
  const [showFind, setShowFind] = useState(false);
  
  const [settings, setSettings] = useState({
    watermark: '',
    margin: 'normal',
    pageBg: 'white',
    gridlines: false,
    darkMode: false,
  });

  const printRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ 
        horizontalRule: false,
        blockquote: false,
      }),
      CustomBlockquote,
      Image, Underline, Superscript, Subscript,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle, FontFamily, Color, Highlight.configure({ multicolor: true }),
      CustomHorizontalRule, PageBreak, TOCBlock, CharacterCount,
      Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
    ],
    content: localStorage.getItem('bookmaker-draft') || defaultHTML,
  });

  useEffect(() => {
    if (settings.darkMode) document.body.classList.add('dark-studio');
    else document.body.classList.remove('dark-studio');
  }, [settings.darkMode]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'BookMaker_Export',
  });

  const saveDraft = () => {
    if (editor) {
      localStorage.setItem('bookmaker-draft', editor.getHTML());
      alert('Draft Saved Successfully! 🚀');
    }
  };

  const toggleDropcap = () => {
    const text = window.prompt("Enter text for Dropcap:");
    if(text && editor) {
       editor.chain().focus().insertContent(`<p><span class="dropcap">${text.charAt(0)}</span>${text.slice(1)}</p>`).run();
    }
  };

  // Compute workspace classes
  const workspaceClasses = `flex-1 overflow-y-auto custom-scrollbar p-6 pb-20 relative flex flex-col items-center editor-workspace ${settings.darkMode ? 'bg-[#020617]' : 'bg-slate-200'}`;
  
  // Compute page classes
  const editorClasses = `editor-a4 prose max-w-none focus:outline-none w-full bg-${settings.pageBg} margin-${settings.margin} ${settings.gridlines ? 'show-gridlines' : ''}`;

  return (
    <div className={`h-screen flex flex-col font-sans selection:bg-blue-200 selection:text-blue-900 overflow-hidden ${settings.darkMode ? 'dark-studio' : 'bg-slate-50'}`}>
      
      {/* Top Title Bar */}
      {!fullScreen && (
        <header className="border-b px-6 py-2 flex items-center justify-between shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-sm">B</div>
            <div>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">BookMaker <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full uppercase font-bold">Ultimate</span></h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-xs flex gap-4 opacity-70">
               <span><strong>{editor?.storage.characterCount.words() || 0}</strong> words</span>
               <span><strong>{editor?.storage.characterCount.characters() || 0}</strong> chars</span>
            </div>
            <div className="flex gap-2">
              <button onClick={saveDraft} className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs font-bold transition-all"><Save size={14} /> Save Draft</button>
              <button onClick={handlePrint} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm"><FileOutput size={14} /> Export PDF</button>
            </div>
          </div>
        </header>
      )}

      {/* Ribbon Tabs Header */}
      {!fullScreen && (
        <div className="flex border-b border-gray-200 bg-slate-50 px-2 shrink-0 ribbon-menu">
          {['home', 'insert', 'layout', 'view'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600 bg-white ribbon-tab-active' : 'border-transparent text-gray-500 hover:bg-slate-100'}`}
            >
              {tab}
            </button>
          ))}
          <div className="flex-1"></div>
          <button onClick={() => setFullScreen(true)} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-slate-100 flex items-center gap-1"><Maximize size={12}/> Fullscreen</button>
        </div>
      )}

      {/* Active Ribbon Content */}
      {!fullScreen && (
        <div className="ribbon-content">
          <RibbonMenu 
            editor={editor} 
            activeTab={activeTab} 
            settings={settings} 
            setSettings={setSettings} 
            toggleDropcap={toggleDropcap}
            openFindReplace={() => setShowFind(!showFind)}
          />
        </div>
      )}

      {/* Fullscreen Exit Button (Only visible in fullscreen) */}
      {fullScreen && (
        <div className="absolute top-4 right-6 z-50">
          <button onClick={() => setFullScreen(false)} className="bg-slate-800/80 hover:bg-slate-900 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur shadow-lg border border-slate-700"><Minimize size={12}/> Exit Fullscreen</button>
        </div>
      )}

      {/* Find and Replace Mock Popup */}
      {showFind && (
        <div className="absolute top-32 right-10 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-72 flex flex-col gap-3">
           <h3 className="text-sm font-bold border-b pb-1">Find & Replace</h3>
           <input type="text" placeholder="Find..." className="border rounded px-2 py-1 text-sm outline-none focus:border-blue-500"/>
           <input type="text" placeholder="Replace with..." className="border rounded px-2 py-1 text-sm outline-none focus:border-blue-500"/>
           <div className="flex gap-2 justify-end">
              <button onClick={() => setShowFind(false)} className="text-xs text-gray-500 hover:text-gray-800">Close</button>
              <button onClick={() => alert('Search feature active in advanced mode!')} className="bg-blue-600 text-white text-xs px-3 py-1 rounded">Find Next</button>
           </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 flex overflow-hidden">
        <section className={workspaceClasses}>
          
          {/* Zoom Controls */}
          <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border border-gray-300 rounded-full shadow-lg px-4 py-1.5 flex items-center gap-4 mb-8 transition-all hover:bg-white w-max mt-2">
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="hover:text-blue-600 font-bold text-gray-500 transition-colors"><Minus size={16}/></button>
            <span className="text-sm font-bold text-gray-700 w-12 text-center select-none">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="hover:text-blue-600 font-bold text-gray-500 transition-colors"><Plus size={16}/></button>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <button onClick={() => setZoom(100)} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-md text-gray-600 font-semibold transition-colors">Reset</button>
          </div>

          <div 
            ref={printRef}
            className="transition-transform duration-200 ease-out origin-top relative" 
            style={{ transform: `scale(${zoom / 100})`, width: '210mm' }}
          >
            {settings.watermark && (
              <div className="watermark-overlay no-print">
                <div className="watermark-text">{settings.watermark}</div>
              </div>
            )}
            <EditorContent editor={editor} className={editorClasses} />
          </div>
          
        </section>
      </main>
    </div>
  );
}

export default App;
