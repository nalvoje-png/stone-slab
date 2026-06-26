import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

// ============================================================
// STONE NFe — App principal
// Tema claro estilo Stone Block: topbar azul, sidebar grafite,
// fundo claro, cards brancos, acentos azuis.
// Conecta no Supabase: auth + tenant + CRUD real.
// ============================================================

// Versão do sistema. Incrementar o último número a cada entrega.
const VERSAO = "1.4.28";

// Tabela de países (código BACEN) para NF-e de exportação. Principais destinos.
const PAISES = [
  {codigo:'1058',nome:'BRASIL'},{codigo:'249',nome:'ESTADOS UNIDOS'},{codigo:'1600',nome:'CHINA'},
  {codigo:'230',nome:'ALEMANHA'},{codigo:'639',nome:'ARGENTINA'},{codigo:'4944',nome:'ITALIA'},
  {codigo:'5550',nome:'PORTUGAL'},{codigo:'1490',nome:'CANADA'},{codigo:'2453',nome:'FRANCA'},
  {codigo:'6289',nome:'REINO UNIDO'},{codigo:'5118',nome:'ESPANHA'},{codigo:'578',nome:'AUSTRALIA'},
  {codigo:'698',nome:'AUSTRALIA'},{codigo:'5860',nome:'SUICA'},{codigo:'4525',nome:'JAPAO'},
  {codigo:'845',nome:'BELGICA'},{codigo:'3595',nome:'HOLANDA (PAISES BAIXOS)'},{codigo:'1287',nome:'CHILE'},
  {codigo:'5037',nome:'MEXICO'},{codigo:'5908',nome:'URUGUAI'},{codigo:'5894',nome:'PARAGUAI'},
  {codigo:'355',nome:'EMIRADOS ARABES UNIDOS'},{codigo:'531',nome:'ARABIA SAUDITA'},
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root { margin: 0; padding: 0; border: 0; width: 100%; height: 100%; overflow: hidden; }

  :root {
    --blue-900: #1e3a8a;
    --blue-800: #1e40af;
    --blue-700: #1d4ed8;
    --blue-600: #2563eb;
    --blue-500: #3b82f6;
    --blue-100: #dbeafe;
    --blue-50:  #eff6ff;

    --side-bg:    #1a1d29;
    --side-bg-2:  #20242f;
    --side-hover: #272b38;
    --side-text:  #c5cad6;
    --side-muted: #6b7280;

    --bg:        #f1f4f9;
    --surface:   #ffffff;
    --border:    #e4e8ef;
    --border-2:  #d4dae3;

    --text:      #1a1d29;
    --text-2:    #4b5563;
    --text-3:    #9aa3b2;

    --green-600:#16a34a; --green-500:#22c55e; --green-50:#ecfdf5;
    --red-600:#dc2626;   --red-500:#ef4444;   --red-50:#fef2f2;
    --amber-600:#b45309; --amber-500:#f59e0b; --amber-50:#fffbeb;

    --font-display:'Sora',sans-serif;
    --font-body:'Inter',sans-serif;
    --font-mono:'JetBrains Mono',monospace;

    --radius-sm:6px; --radius:10px; --radius-lg:14px; --radius-xl:20px;
    --shadow-sm:0 1px 2px rgba(16,24,40,0.06);
    --shadow:0 4px 16px rgba(16,24,40,0.08);
    --shadow-lg:0 12px 40px rgba(16,24,40,0.16);
  }

  html, body, #root { height: 100%; }
  body{font-family:var(--font-body);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;}

  .login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:radial-gradient(circle at 30% 20%, #1e3a8a, #0f172a 70%);padding:24px;}
  .login-card{background:var(--surface);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);
    width:100%;max-width:420px;padding:40px 36px;}
  .login-logo{display:flex;align-items:center;gap:12px;margin-bottom:8px;}
  .login-logo-icon{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--blue-500),var(--blue-800));
    display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--font-display);font-weight:800;font-size:18px;
    box-shadow:0 4px 14px rgba(37,99,235,0.4);}
  .login-title{font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--text);}
  .login-title b{color:var(--blue-600);}
  .login-sub{font-size:14px;color:var(--text-3);margin:6px 0 28px;}

  .app{display:flex;height:100vh;overflow:hidden;}
  .sidebar{width:236px;min-width:236px;background:var(--side-bg);display:flex;flex-direction:column;overflow:hidden;}
  .sidebar-logo{padding:18px 20px;display:flex;align-items:center;gap:10px;}
  .logo-icon{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,var(--blue-500),var(--blue-800));
    display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--font-display);font-weight:800;font-size:14px;flex-shrink:0;}
  .logo-text{font-family:var(--font-display);font-weight:800;font-size:17px;color:#fff;letter-spacing:-0.3px;}
  .logo-text b{color:var(--blue-500);}
  .topbar-versao{display:inline-block;margin-left:10px;font-size:11px;font-weight:700;letter-spacing:1px;
    text-transform:uppercase;color:#fff;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.28);
    padding:2px 10px;border-radius:20px;vertical-align:middle;}

  .nav-label{font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--side-muted);padding:14px 20px 8px;}
  .sidebar-nav{flex:1;overflow-y:auto;padding:0 12px;}
  .nav-item{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:var(--radius);cursor:pointer;
    border:none;background:transparent;width:100%;text-align:left;color:var(--side-text);font-family:var(--font-body);
    font-size:14px;font-weight:500;transition:all .14s;margin-bottom:2px;position:relative;}
  .nav-item:hover{background:var(--side-hover);color:#fff;}
  .nav-item.active{background:var(--blue-600);color:#fff;box-shadow:0 4px 12px rgba(37,99,235,0.35);}
  .nav-icon{font-size:16px;width:18px;text-align:center;flex-shrink:0;}
  .nav-badge{margin-left:auto;background:var(--blue-500);color:#fff;font-size:10px;font-weight:700;padding:1px 7px;border-radius:10px;font-family:var(--font-mono);}
  .nav-item.active .nav-badge{background:rgba(255,255,255,0.25);}

  /* ===== Accordion (submenus) ===== */
  .sidebar-nav{padding-top:8px;}
  .nav-group{margin-bottom:2px;}
  .nav-parent{display:flex;align-items:center;gap:11px;padding:11px 12px;border-radius:var(--radius);cursor:pointer;
    border:none;background:transparent;width:100%;text-align:left;color:var(--side-muted);font-family:var(--font-body);
    font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;transition:all .14s;}
  .nav-parent:hover{background:var(--side-hover);color:var(--side-text);}
  .nav-parent.has-active{color:#fff;}
  .nav-parent .nav-icon{font-size:15px;}
  .nav-parent-label{flex:1;}
  .nav-caret{font-size:16px;transition:transform .25s;opacity:0.7;line-height:1;}
  .nav-caret.open{transform:rotate(180deg);}
  /* container dos filhos: anima abrir/fechar via max-height */
  .nav-sub{max-height:0;overflow:hidden;transition:max-height .25s ease;}
  .nav-sub.open{max-height:400px;margin-bottom:6px;}
  .nav-child{padding-left:34px;font-size:13.5px;}
  .nav-child .nav-icon{font-size:14px;}

  .sidebar-footer{padding:12px;border-top:1px solid rgba(255,255,255,0.07);}
  .user-card{display:flex;align-items:center;gap:10px;padding:8px 10px;margin-bottom:8px;}
  .avatar{width:34px;height:34px;border-radius:9px;background:var(--blue-600);color:#fff;display:flex;align-items:center;
    justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;}
  .user-name{font-size:13px;font-weight:600;color:#fff;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px;}
  .user-role{font-size:11px;color:var(--side-muted);}
  .side-btn{display:flex;align-items:center;gap:8px;width:100%;padding:9px 12px;border-radius:var(--radius);
    font-size:13px;font-weight:500;cursor:pointer;border:1px solid transparent;transition:all .14s;font-family:var(--font-body);margin-bottom:6px;}
  .side-btn-config{background:rgba(255,255,255,0.04);color:var(--side-text);border-color:rgba(255,255,255,0.08);}
  .side-btn-config:hover{background:rgba(255,255,255,0.09);color:#fff;}
  .side-btn-exit{background:rgba(239,68,68,0.1);color:#fca5a5;border-color:rgba(239,68,68,0.2);}
  .side-btn-exit:hover{background:var(--red-600);color:#fff;}

  .main{flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--bg);}
  .topbar{height:60px;min-height:60px;background:linear-gradient(90deg,var(--blue-900),var(--blue-700));
    display:flex;align-items:center;padding:0 24px;gap:16px;box-shadow:0 2px 12px rgba(30,58,138,0.3);}
  .topbar-brand{font-family:var(--font-display);font-weight:800;font-size:18px;color:#fff;}
  .topbar-brand b{color:#93c5fd;}
  .topbar-spacer{flex:1;}
  .topbar-env{font-size:11px;font-family:var(--font-mono);font-weight:600;padding:4px 11px;border-radius:20px;letter-spacing:.5px;}
  .topbar-env.homologacao{background:rgba(245,158,11,0.2);color:#fde68a;border:1px solid rgba(245,158,11,0.4);}
  .topbar-env.producao{background:rgba(34,197,94,0.2);color:#bbf7d0;border:1px solid rgba(34,197,94,0.4);}
  .topbar-avatar{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.15);color:#fff;display:flex;
    align-items:center;justify-content:center;font-weight:700;font-size:13px;}

  .page{flex:1;overflow-y:auto;padding:28px 32px;}

  .section-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;gap:16px;}
  .page-title{font-family:var(--font-display);font-size:26px;font-weight:800;color:var(--text);line-height:1.1;}
  .page-sub{font-size:14px;color:var(--text-3);margin-top:5px;}

  .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);transition:border-color 0.2s;}
  .card-pad{padding:24px;}

  .btn{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;border-radius:var(--radius);
    font-family:var(--font-body);font-size:14px;font-weight:600;cursor:pointer;border:none;transition:all .14s;white-space:nowrap;}
  .btn:disabled{opacity:.55;cursor:not-allowed;}
  .btn-primary{background:var(--blue-600);color:#fff;box-shadow:0 2px 10px rgba(37,99,235,0.25);}
  .btn-primary:hover:not(:disabled){background:var(--blue-700);box-shadow:0 4px 16px rgba(37,99,235,0.4);}
  .btn-ghost{background:var(--surface);color:var(--text-2);border:1px solid var(--border-2);}
  .btn-ghost:hover:not(:disabled){background:var(--bg);border-color:var(--blue-500);color:var(--blue-700);}
  .btn-danger{background:var(--red-50);color:var(--red-600);border:1px solid #fecaca;}
  .btn-danger:hover:not(:disabled){background:var(--red-600);color:#fff;border-color:transparent;}
  .btn-emit{background:linear-gradient(135deg,var(--blue-500),var(--blue-800));color:#fff;font-weight:700;
    box-shadow:0 4px 18px rgba(37,99,235,0.4);}
  .btn-emit:hover:not(:disabled){box-shadow:0 6px 26px rgba(37,99,235,0.55);transform:translateY(-1px);}
  .btn-sm{padding:6px 12px;font-size:13px;}
  .btn-lg{padding:13px 26px;font-size:15px;}
  .btn-block{width:100%;justify-content:center;}

  .form-grid{display:grid;gap:16px;}
  .form-grid-2{grid-template-columns:1fr 1fr;}
  .form-grid-3{grid-template-columns:1fr 1fr 1fr;}
  .form-grid-4{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:14px;}
  .form-group{display:flex;flex-direction:column;gap:6px;}
  .col-2{grid-column:span 2;} .col-3{grid-column:span 3;}
  label{font-size:12px;font-weight:600;color:var(--text-2);}
  input,select,textarea{background:var(--surface);border:1px solid var(--border-2);border-radius:var(--radius);
    padding:10px 12px;font-family:var(--font-body);font-size:14px;color:var(--text);outline:none;transition:all .14s;width:100%;}
  input:focus,select:focus,textarea:focus{border-color:var(--blue-500);box-shadow:0 0 0 3px rgba(59,130,246,0.15);}
  input:disabled,input[readonly],select:disabled{background:var(--bg);color:var(--text-3);cursor:not-allowed;}
  input::placeholder,textarea::placeholder{color:var(--text-3);}
  textarea{resize:vertical;min-height:80px;}
  .form-hint{font-size:11px;color:var(--text-3);}

  .table-wrap{overflow-x:auto;}
  table{width:100%;border-collapse:collapse;font-size:14px;}
  thead th{text-align:left;padding:11px 14px;font-size:11px;font-weight:700;color:var(--text-3);
    letter-spacing:.5px;text-transform:uppercase;border-bottom:1px solid var(--border);white-space:nowrap;}
  tbody tr{border-bottom:1px solid var(--border);transition:background .1s;}
  tbody tr:hover{background:var(--blue-50);}
  tbody tr:last-child{border-bottom:none;}
  tbody td{padding:13px 14px;color:var(--text-2);vertical-align:middle;}
  .mono{font-family:var(--font-mono);font-size:12px;}
  .cell-strong{font-weight:600;color:var(--text);}
  .cell-money{font-family:var(--font-mono);color:var(--blue-700);font-weight:600;}

  .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;font-family:var(--font-mono);}
  .badge-rascunho{background:#f1f4f9;color:#64748b;}
  .badge-processando{background:var(--amber-50);color:var(--amber-600);border:1px solid #fde68a;}
  .badge-autorizada{background:var(--green-50);color:var(--green-600);border:1px solid #bbf7d0;}
  .badge-rejeitada{background:var(--red-50);color:var(--red-600);border:1px solid #fecaca;}
  .badge-cancelada{background:#f1f4f9;color:#94a3b8;text-decoration:line-through;}

  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;}
  .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;
    box-shadow:var(--shadow-sm);position:relative;overflow:hidden;transition:all .18s;}
  .stat-card:hover{box-shadow:var(--shadow);transform:translateY(-2px);border-color:var(--blue-500);}
  .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--blue-600),var(--blue-500));}
  .stat-label{font-size:11px;font-weight:700;color:var(--text-3);letter-spacing:.6px;text-transform:uppercase;margin-bottom:10px;}
  .stat-value{font-family:var(--font-display);font-size:28px;font-weight:800;color:var(--text);line-height:1;}
  .stat-unit{font-size:13px;color:var(--text-3);margin-top:5px;}

  .modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.5);backdrop-filter:blur(3px);
    display:flex;align-items:center;justify-content:center;z-index:1000;padding:24px;}
  .modal{background:var(--surface);border-radius:var(--radius-xl);width:100%;max-width:720px;max-height:90vh;
    overflow-y:auto;box-shadow:var(--shadow-lg);}
  .modal-lg{max-width:980px;}
  .modal-header{padding:18px 24px;display:flex;align-items:flex-start;
    justify-content:space-between;gap:16px;position:sticky;top:0;z-index:10;
    background:linear-gradient(120deg,#16306b,#1e448f 60%,#2657b0);}
  .modal-title{font-family:var(--font-display);font-size:18px;font-weight:700;color:#fff;}
  .modal-sub{font-size:13px;color:#bcd0f5;margin-top:2px;}
  .modal-close{background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);color:#fff;width:32px;height:32px;
    border-radius:var(--radius);cursor:pointer;font-size:18px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
  .modal-close:hover{background:rgba(255,255,255,0.28);color:#fff;}
  .modal-body{padding:24px 26px;}

  /* ===== Modal compacto (cadastro de bloco) ===== */
  .modal-compacto .modal-body{padding:16px 20px;}
  .modal-compacto .form-grid{gap:9px !important;}
  .modal-compacto .form-group{gap:3px !important;}
  .modal-compacto label{font-size:11px !important;margin:0 !important;}
  .modal-compacto input,.modal-compacto select,.modal-compacto textarea{padding:6px 9px !important;font-size:13px !important;}
  .modal-compacto textarea{min-height:46px !important;}
  .modal-compacto .stat-label{font-size:10px;margin-bottom:6px !important;}
  .modal-footer{padding:16px 26px;display:flex;justify-content:flex-end;gap:10px;border-top:1px solid var(--border);
    position:sticky;bottom:0;background:var(--surface);}

  .toast-container{position:fixed;bottom:24px;right:24px;display:flex;flex-direction:column;gap:8px;z-index:9999;}
  .toast{background:var(--surface);border-radius:var(--radius);padding:13px 18px;font-size:14px;color:var(--text);
    display:flex;align-items:center;gap:10px;box-shadow:var(--shadow-lg);min-width:260px;border-left:3px solid var(--blue-500);
    animation:slideIn .2s ease;}
  .toast.success{border-left-color:var(--green-500);}
  .toast.error{border-left-color:var(--red-500);}
  @keyframes slideIn{from{transform:translateX(110%);opacity:0;}to{transform:translateX(0);opacity:1;}}

  .tabs{display:flex;gap:4px;border-bottom:1px solid var(--border);margin-bottom:24px;}
  .tab{padding:10px 16px;font-size:14px;font-weight:600;color:var(--text-3);cursor:pointer;border:none;background:transparent;
    border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .14s;font-family:var(--font-body);}
  .tab:hover{color:var(--text-2);}
  .tab.active{color:var(--blue-600);border-bottom-color:var(--blue-600);}

  .steps{display:flex;align-items:center;margin-bottom:24px;}
  .step{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600;color:var(--text-3);}
  .step-num{width:28px;height:28px;border-radius:50%;background:var(--surface);border:2px solid var(--border-2);
    display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:var(--font-mono);flex-shrink:0;}
  .step.active{color:var(--text);} .step.active .step-num{background:var(--blue-600);border-color:var(--blue-600);color:#fff;}
  .step.done .step-num{background:var(--green-600);border-color:var(--green-600);color:#fff;}
  .step-line{flex:1;height:2px;background:var(--border);margin:0 12px;max-width:60px;}

  .alert{padding:13px 16px;border-radius:var(--radius);font-size:13px;display:flex;gap:10px;align-items:flex-start;}
  .alert-warning{background:var(--amber-50);border:1px solid #fde68a;color:var(--amber-600);}
  .alert-info{background:var(--blue-50);border:1px solid #bfdbfe;color:var(--blue-700);}

  .item-row{display:grid;grid-template-columns:2fr 1fr 0.8fr 0.8fr 0.9fr 1fr auto;gap:8px;align-items:end;
    padding:12px;background:var(--bg);border-radius:var(--radius);border:1px solid var(--border);margin-bottom:8px;}
  .item-row:last-child{margin-bottom:0;}
  .item-row input,.item-row select{background:var(--surface);}

  .empty-state{text-align:center;padding:56px 20px;color:var(--text-3);}
  .empty-icon{font-size:46px;margin-bottom:14px;}
  .empty-title{font-family:var(--font-display);font-size:18px;font-weight:700;color:var(--text-2);margin-bottom:6px;}
  .divider{height:1px;background:var(--border);margin:18px 0;border:none;}

  .spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;
    animation:spin .7s linear infinite;display:inline-block;}
  @keyframes spin{to{transform:rotate(360deg);}}
  .center-load{min-height:100vh;display:flex;align-items:center;justify-content:center;color:var(--blue-600);}

  ::-webkit-scrollbar{width:8px;height:8px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}
  ::-webkit-scrollbar-thumb:hover{background:#94a3b8;}

  @media(max-width:900px){.stats-grid{grid-template-columns:1fr 1fr;}.form-grid-3{grid-template-columns:1fr 1fr;}}

  /* ===== Logo ===== */
  .logo-symbol-img{width:34px;height:34px;border-radius:9px;flex-shrink:0;object-fit:cover;
    box-shadow:0 2px 10px rgba(37,99,235,0.4);}
  .topbar-logo-img{width:32px;height:32px;border-radius:8px;object-fit:cover;}

  /* ===== Crédito NVX Technology ===== */
  .nvx-credit{display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:22px;}
  .nvx-credit span{font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:1px;text-transform:uppercase;}
  .nvx-credit img{width:128px;height:auto;opacity:0.95;}
  .nvx-credit-side{margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.07);
    display:flex;flex-direction:column;align-items:center;gap:5px;}
  .nvx-credit-side span{font-size:9px;color:var(--side-muted);letter-spacing:.8px;text-transform:uppercase;}
  .nvx-credit-side img{width:104px;height:auto;opacity:0.9;}
  /* crédito dentro do card branco do login */
  /* crédito (texto) no rodapé do card de login */
  .nvx-credit-login{text-align:center;font-size:12px;color:var(--text-3);letter-spacing:.3px;}
  .nvx-credit-login b{color:var(--blue-700);font-weight:700;}

  /* ===== Dashboard com vida ===== */
  .hero-banner{position:relative;overflow:hidden;border-radius:var(--radius-lg);padding:26px 28px;margin-bottom:24px;
    background:linear-gradient(120deg,#0a283c,#0d475c 60%,#146678);
    display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;
    box-shadow:0 8px 30px rgba(10,40,60,0.35);}
  .hero-bg{position:absolute;inset:0;opacity:0.5;
    background:radial-gradient(600px 200px at 90% -20%, rgba(94,180,200,0.3), transparent 60%),
               radial-gradient(400px 200px at 10% 120%, rgba(60,140,160,0.22), transparent 60%);}
  .hero-greet{font-family:var(--font-display);font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;}
  .hero-sub{font-size:14px;color:#a5d2dd;margin-top:4px;text-transform:capitalize;}
  .hero-btn{background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);color:#fff;
    padding:10px 18px;border-radius:var(--radius);font-weight:600;font-size:14px;cursor:pointer;transition:all .15s;}
  .hero-btn:hover{background:rgba(255,255,255,0.25);}
  .kpi-icon{position:absolute;top:16px;right:16px;font-size:22px;opacity:0.25;}
  .stat-card.kpi-blue::before{background:linear-gradient(90deg,var(--blue-600),var(--blue-400),transparent);}
  .stat-card.kpi-green::before{background:linear-gradient(90deg,var(--green-600),var(--green-500),transparent);}
  .stat-card.kpi-red::before{background:linear-gradient(90deg,var(--red-600),var(--red-500),transparent);}
  .stat-card.kpi-violet::before{background:linear-gradient(90deg,#7c3aed,#a78bfa,transparent);}

  /* ===== Banner de página padrão (estilo Dashboard) ===== */
  .page-banner{position:relative;overflow:hidden;border-radius:var(--radius-lg);padding:20px 24px;margin-bottom:22px;
    background:linear-gradient(120deg,#0a283c,#0d475c 62%,#146678);
    display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap;
    box-shadow:0 6px 22px rgba(10,40,60,0.3);}
  .page-banner-bg{position:absolute;inset:0;opacity:0.5;
    background:radial-gradient(500px 180px at 92% -30%, rgba(94,180,200,0.28), transparent 60%),
               radial-gradient(360px 160px at 6% 130%, rgba(60,140,160,0.2), transparent 60%);}
  .page-banner-title{font-family:var(--font-display);font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.4px;line-height:1.1;}
  .page-banner-sub{font-size:13px;color:#a5d2dd;margin-top:4px;}
  /* botões dentro do banner: brancos translúcidos */
  .page-banner .btn-primary{background:rgba(255,255,255,0.16) !important;border:1px solid rgba(255,255,255,0.28);}
  .page-banner .btn-primary:hover{background:rgba(255,255,255,0.26) !important;}

  /* ===== Degradês sutis (modernização) ===== */
  .topbar{background:linear-gradient(100deg,#0a283c 0%,#0d475c 55%,#146678 100%) !important;}
  .sidebar{background:linear-gradient(180deg,#1d2130 0%,var(--side-bg) 60%) !important;}
  .login-wrap{background:radial-gradient(circle at 30% 15%, #1e3a8a, #0b1120 70%) !important;}
  .nav-item.active{background:linear-gradient(100deg,var(--blue-600),var(--blue-700)) !important;}
  .btn-primary{background:linear-gradient(135deg,var(--blue-500),var(--blue-700)) !important;}
  .stat-card::before{height:3px;background:linear-gradient(90deg,var(--blue-600),var(--blue-400),transparent) !important;}
  .login-card{background:linear-gradient(170deg,#ffffff,#f7f9fc) !important;}

  /* ===== Menu hambúrguer (oculto no desktop) ===== */
  .menu-toggle{display:none;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.2);
    color:#fff;width:38px;height:38px;border-radius:10px;font-size:18px;cursor:pointer;align-items:center;justify-content:center;}
  .menu-toggle:hover{background:rgba(255,255,255,0.24);}
  .topbar-logo-img{display:none;}
  .sidebar-backdrop{display:none;}

  /* ===== RESPONSIVO MOBILE ===== */
  @media(max-width:768px){
    .menu-toggle{display:flex;}
    .topbar-logo-img{display:block;}
    .topbar-brand{font-size:16px;}
    .sidebar{position:fixed;top:0;left:0;bottom:0;z-index:1200;transform:translateX(-100%);
      transition:transform .25s ease;box-shadow:8px 0 32px rgba(0,0,0,0.4);}
    .sidebar.open{transform:translateX(0);}
    .sidebar-backdrop{display:block;position:fixed;inset:0;background:rgba(15,23,42,0.5);z-index:1100;}
    .page{padding:18px 16px;}
    .topbar{padding:0 14px;gap:10px;}
    .stats-grid{grid-template-columns:1fr 1fr;gap:12px;}
    .section-header{flex-direction:column;align-items:stretch;}
    .form-grid-2,.form-grid-3{grid-template-columns:1fr;}
    .col-2,.col-3{grid-column:span 1;}
    .page-title{font-size:22px;}
    .item-row{grid-template-columns:1fr 1fr;}
    .modal{max-width:100%;}
    .topbar-env{display:none;}
    table{font-size:13px;}
    thead th,tbody td{padding:9px 8px;}
    .hero-banner{padding:20px;flex-direction:column;align-items:stretch;}
    .hero-greet{font-size:20px;}
    div[style*="grid-template-columns:1.4fr 1fr"],div[style*="grid-template-columns:1fr 1fr"]{grid-template-columns:1fr !important;}
  }
  @media(max-width:480px){
    .stats-grid{grid-template-columns:1fr;}
  }
`;

// ============================================================
// UTILITÁRIOS
// ============================================================
const fmt = {
  moeda:(v)=> (Number(v)||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}),
  data:(v)=> v? new Date(v+'T12:00:00').toLocaleDateString('pt-BR') : '-',
};
const maskCNPJ=(v)=>v.replace(/\D/g,'').slice(0,14).replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2');
const soDigitos=(v)=>(v||'').toString().replace(/\D/g,'');

// ===== Validadores de documentos (com dígito verificador) =====
function validaCPF(v){
  const c=soDigitos(v);
  if(c.length!==11||/^(\d)\1{10}$/.test(c)) return false;
  let s=0; for(let i=0;i<9;i++) s+=parseInt(c[i])*(10-i);
  let d=11-(s%11); if(d>=10)d=0; if(d!==parseInt(c[9])) return false;
  s=0; for(let i=0;i<10;i++) s+=parseInt(c[i])*(11-i);
  d=11-(s%11); if(d>=10)d=0; return d===parseInt(c[10]);
}
function validaCNPJ(v){
  const c=soDigitos(v);
  if(c.length!==14||/^(\d)\1{13}$/.test(c)) return false;
  const calc=(base)=>{
    let s=0,pos=base.length-7;
    for(let i=base.length;i>=1;i--){s+=base[base.length-i]*pos--;if(pos<2)pos=9;}
    const r=s%11; return r<2?0:11-r;
  };
  const d1=calc(c.slice(0,12));
  if(d1!==parseInt(c[12])) return false;
  const d2=calc(c.slice(0,13));
  return d2===parseInt(c[13]);
}
function validaCEP(v){ return soDigitos(v).length===8; }
// valida CNPJ ou CPF conforme o tamanho
function validaDoc(v){
  const d=soDigitos(v);
  if(d.length===11) return validaCPF(d);
  if(d.length===14) return validaCNPJ(d);
  return false;
}
const maskCEP=(v)=>v.replace(/\D/g,'').slice(0,8).replace(/^(\d{5})(\d)/,'$1-$2');
const iniciais=(n)=> (n||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();

const CFOP_OPCOES=[
  {value:"5101",label:"5101 - Venda de produção (dentro do estado)"},
  {value:"5102",label:"5102 - Venda de mercadoria adquirida (dentro do estado)"},
  {value:"6101",label:"6101 - Venda de produção (fora do estado)"},
  {value:"6102",label:"6102 - Venda de mercadoria adquirida (fora do estado)"},
  {value:"6107",label:"6107 - Venda de produção - Simples Nacional (fora estado)"},
  {value:"7101",label:"7101 - Exportação de produção"},
];
const UFs=['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

function getStatusBadge(status){
  const map={rascunho:{c:'badge-rascunho',i:'○',l:'Rascunho'},processando:{c:'badge-processando',i:'◑',l:'Processando'},
    autorizada:{c:'badge-autorizada',i:'●',l:'Autorizada'},rejeitada:{c:'badge-rejeitada',i:'✕',l:'Rejeitada'},
    cancelada:{c:'badge-cancelada',i:'—',l:'Cancelada'}};
  const s=map[status]||map.rascunho;
  return <span className={`badge ${s.c}`}>{s.i} {s.l}</span>;
}

// Cabeçalho de página padrão: banner com gradiente (estilo Dashboard).
// `acao` é um botão/elemento opcional à direita.
function PageHeader({titulo,sub,acao}){
  return (
    <div className="page-banner">
      <div className="page-banner-bg"/>
      <div style={{position:'relative',zIndex:2}}>
        <div className="page-banner-title">{titulo}</div>
        {sub && <div className="page-banner-sub">{sub}</div>}
      </div>
      {acao && <div style={{position:'relative',zIndex:2}}>{acao}</div>}
    </div>
  );
}

// ============================================================
// TOAST HOOK
// ============================================================
function useToast(){
  const [toasts,setToasts]=useState([]);
  const toast=useCallback((msg,type='info')=>{
    const id=Date.now()+Math.random();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3500);
  },[]);
  return {toasts,toast};
}
function ToastContainer({toasts}){
  return <div className="toast-container">{toasts.map(t=>(
    <div key={t.id} className={`toast ${t.type}`}>
      <span>{t.type==='success'?'✓':t.type==='error'?'✕':'ℹ'}</span>{t.msg}
    </div>))}</div>;
}

// ============================================================
// TELA DE LOGIN
// ============================================================
function Login({toast}){
  const [email,setEmail]=useState('');
  const [senha,setSenha]=useState('');
  const [loading,setLoading]=useState(false);

  async function entrar(){
    if(!email||!senha){toast('Preencha e-mail e senha','error');return;}
    setLoading(true);
    const {error}=await supabase.auth.signInWithPassword({email,password:senha});
    setLoading(false);
    if(error) toast('Erro ao entrar: '+error.message,'error');
    // sucesso: o listener onAuthStateChange no App cuida do resto
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo" style={{justifyContent:'center',marginBottom:6}}>
          <img src="/logo_full.png" alt="Stone NFe" style={{maxWidth:'100%',height:'auto',display:'block'}}/>
        </div>
        <div className="login-sub" style={{textAlign:'center'}}>Emissor de NF-e para pedreiras</div>

        <div className="form-grid" style={{gap:14}}>
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@empresa.com.br"/>
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input type="password" value={senha} onChange={e=>setSenha(e.target.value)}
              placeholder="Sua senha"
              onKeyDown={e=>e.key==='Enter'&&entrar()}/>
          </div>

          <button className="btn btn-primary btn-block btn-lg" disabled={loading} onClick={entrar}>
            {loading? <span className="spinner"/> : 'Entrar'}
          </button>
        </div>

        <div className="divider"/>
        <div className="nvx-credit-login">
          Desenvolvido por <b>NVX Tecnologia</b>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({notas,emitente,tenant,nomeUser,contasReceber,contasPagar,caixa,goTo}){
  const autorizadas=notas.filter(n=>n.status==='autorizada');
  const total=autorizadas.reduce((a,n)=>a+Number(n.valor_total||0),0);
  const pad=periodoMesAtual();
  const cxMes=caixa.filter(l=>dentroPeriodo(l.data,pad.ini,pad.fim));
  const entradas=cxMes.filter(l=>l.tipo==='entrada').reduce((a,l)=>a+Number(l.valor||0),0);
  const saidas=cxMes.filter(l=>l.tipo==='saida').reduce((a,l)=>a+Number(l.valor||0),0);
  const saldo=entradas-saidas;
  const aReceber=contasReceber.filter(c=>['aberto','parcial','vencido'].includes(statusConta(c))).reduce((a,c)=>a+(Number(c.valor||0)-Number(c.valor_recebido||0)),0);
  const aPagar=contasPagar.filter(c=>['aberto','parcial','vencido'].includes(statusConta(c))).reduce((a,c)=>a+(Number(c.valor||0)-Number(c.valor_pago||0)),0);
  const vencendoHoje=[...contasReceber,...contasPagar].filter(c=>c.data_vencimento===hojeISO()&&['aberto','parcial'].includes(statusConta(c))).length;
  const hora=new Date().getHours();
  const saud=hora<12?'Bom dia':hora<18?'Boa tarde':'Boa noite';
  const primeiroNome=(nomeUser||'').split(/[\s@]/)[0];

  return (
    <div className="page">
      {/* Banner de boas-vindas */}
      <div className="hero-banner">
        <div className="hero-bg"/>
        <div style={{position:'relative',zIndex:2}}>
          <div className="hero-greet">{saud}, {primeiroNome} 👋</div>
          <div className="hero-sub">{tenant?.nome||'Stone NFe'} · {new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})} · <span style={{opacity:0.85}}>v{VERSAO}</span></div>
        </div>
        <div style={{position:'relative',zIndex:2,display:'flex',gap:10,flexWrap:'wrap'}}>
          <button className="btn btn-emit" onClick={()=>goTo('emitir')}>⚡ Emitir NF-e</button>
          <button className="hero-btn" onClick={()=>goTo('blocos')}>+ Cadastrar Bloco</button>
        </div>
      </div>

      {emitente?.focus_ambiente!=='producao' && (
        <div className="alert alert-warning" style={{marginBottom:20}}>
          ⚠ Ambiente de <strong>homologação</strong>. As notas aqui não têm validade fiscal. Configure o token de produção em Configurações quando estiver pronto.
        </div>
      )}

      {(()=>{
        if(!emitente?.certificado_validade) return null;
        const hoje=new Date(); const venc=new Date(emitente.certificado_validade+'T00:00:00');
        const dias=Math.ceil((venc-hoje)/(1000*60*60*24));
        if(dias>30) return null;
        const vencido=dias<0;
        return (
          <div className={`alert ${vencido?'alert-danger-box':'alert-warning'}`} style={{marginBottom:20,
            ...(vencido?{background:'var(--red-50)',border:'1px solid #fecaca',color:'var(--red-600)'}:{})}}>
            🔐 {vencido
              ? <>Seu certificado digital <strong>venceu</strong> em {fmt.data(emitente.certificado_validade)}. Não é possível emitir notas até renovar.</>
              : <>Seu certificado digital vence em <strong>{dias} dia{dias!==1?'s':''}</strong> ({fmt.data(emitente.certificado_validade)}). Renove para não interromper a emissão.</>}
            {' '}<button className="btn btn-sm" style={{marginLeft:8,background:'#fff',border:'1px solid currentColor'}} onClick={()=>goTo('config')}>Renovar certificado</button>
          </div>
        );
      })()}

      {/* KPIs financeiros */}
      <div className="stats-grid">
        <div className="stat-card kpi-blue" onClick={()=>goTo('notas')} style={{cursor:'pointer'}}>
          <div className="kpi-icon">📄</div>
          <div className="stat-label">Faturado (NF-e)</div>
          <div className="stat-value" style={{fontSize:22}}>{fmt.moeda(total)}</div>
          <div className="stat-unit">{autorizadas.length} autorizadas</div>
        </div>
        <div className="stat-card kpi-green" onClick={()=>goTo('receber')} style={{cursor:'pointer'}}>
          <div className="kpi-icon">↘</div>
          <div className="stat-label">A Receber</div>
          <div className="stat-value" style={{fontSize:22,color:'var(--green-600)'}}>{fmt.moeda(aReceber)}</div>
          <div className="stat-unit">em aberto</div>
        </div>
        <div className="stat-card kpi-red" onClick={()=>goTo('pagar')} style={{cursor:'pointer'}}>
          <div className="kpi-icon">↗</div>
          <div className="stat-label">A Pagar</div>
          <div className="stat-value" style={{fontSize:22,color:'var(--red-500)'}}>{fmt.moeda(aPagar)}</div>
          <div className="stat-unit">em aberto</div>
        </div>
        <div className="stat-card kpi-violet" onClick={()=>goTo('caixa')} style={{cursor:'pointer'}}>
          <div className="kpi-icon">💰</div>
          <div className="stat-label">Saldo do Mês</div>
          <div className="stat-value" style={{fontSize:22,color:saldo>=0?'var(--blue-700)':'var(--red-500)'}}>{fmt.moeda(saldo)}</div>
          <div className="stat-unit">{vencendoHoje>0?`${vencendoHoje} vence(m) hoje`:'em dia'}</div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:18}}>
        {/* Últimas notas */}
        <div className="card card-pad">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div style={{fontFamily:'var(--font-display)',fontSize:16,fontWeight:700}}>Últimas Notas</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>goTo('notas')}>Ver todas</button>
          </div>
          {notas.length===0? <div className="empty-state"><div className="empty-icon">📄</div><div className="empty-title">Nenhuma nota ainda</div><div>Emita sua primeira NF-e</div></div> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Número</th><th>Cliente</th><th>Valor</th><th>Status</th></tr></thead>
            <tbody>{notas.slice(0,6).map(n=>(
              <tr key={n.id}>
                <td className="mono cell-strong">{n.numero?`${n.numero}/${n.serie}`:'—'}</td>
                <td className="cell-strong" style={{maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.destinatario_nome}</td>
                <td className="cell-money">{fmt.moeda(n.valor_total)}</td>
                <td>{getStatusBadge(n.status)}</td>
              </tr>))}</tbody>
          </table></div>)}
        </div>

        {/* Fluxo do mês */}
        <div className="card card-pad">
          <div style={{fontFamily:'var(--font-display)',fontSize:16,fontWeight:700,marginBottom:16}}>Fluxo do Mês</div>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <BarraComp label="Entradas" valor={entradas} max={Math.max(entradas,saidas,1)} cor="var(--green-500)"/>
            <BarraComp label="Saídas" valor={saidas} max={Math.max(entradas,saidas,1)} cor="var(--red-500)"/>
            <div style={{marginTop:6,padding:'14px 16px',borderRadius:'var(--radius)',background:'linear-gradient(135deg,var(--blue-50),#fff)',border:'1px solid var(--border)'}}>
              <div className="stat-label">Saldo do período</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:26,fontWeight:800,color:saldo>=0?'var(--blue-700)':'var(--red-500)'}}>{fmt.moeda(saldo)}</div>
            </div>
            <button className="btn btn-ghost btn-block" onClick={()=>goTo('relatorios')}>▤ Ver relatórios completos</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DESTINATÁRIOS (CRUD Supabase)
// ============================================================
// ===== Parser de XML da NF-e (extrai dados da nota do fornecedor) =====
function parseNFeXML(xmlText){
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
  if(doc.querySelector('parsererror')) throw new Error('XML inválido');
  const g = (sel, ctx=doc)=> ctx.querySelector(sel)?.textContent?.trim() || '';
  const infNFe = doc.querySelector('infNFe');
  if(!infNFe) throw new Error('Não é um XML de NF-e válido (sem infNFe)');

  const chave = (infNFe.getAttribute('Id')||'').replace(/^NFe/,'');
  const ide = doc.querySelector('ide');
  const emit = doc.querySelector('emit');
  const total = doc.querySelector('ICMSTot');

  const itens = Array.from(doc.querySelectorAll('det')).map(det=>{
    const prod = det.querySelector('prod');
    const gp=(s)=>prod?.querySelector(s)?.textContent?.trim()||'';
    // CST do ICMS pode estar em qualquer subgrupo (ICMS00, ICMS60, etc.)
    const cst = det.querySelector('ICMS CST, ICMS CSOSN')?.textContent?.trim()||'';
    const icmsVal = det.querySelector('ICMS vICMS')?.textContent?.trim()||'0';
    return {
      numero_item: det.getAttribute('nItem'),
      codigo_fornecedor: gp('cProd'),
      descricao: gp('xProd'),
      ncm: gp('NCM'),
      cfop_origem: gp('CFOP'),
      unidade: gp('uCom'),
      quantidade: gp('qCom'),
      valor_unitario: gp('vUnCom'),
      valor_total: gp('vProd'),
      icms_cst: cst,
      icms_valor: icmsVal,
    };
  });

  return {
    chave_acesso: chave,
    numero: g('ide nNF'),
    serie: g('ide serie'),
    modelo: g('ide mod') || '55',
    natureza_operacao: g('ide natOp'),
    data_emissao: (g('ide dhEmi')||g('ide dEmi')||'').slice(0,10),
    emit_cnpj: g('emit CNPJ'),
    emit_razao_social: g('emit xNome'),
    emit_ie: g('emit IE'),
    emit_uf: g('emit enderEmit UF'),
    emit_municipio: g('emit enderEmit xMun'),
    emit_codigo_municipio: g('emit enderEmit cMun'),
    valor_produtos: g('ICMSTot vProd'),
    valor_total: g('ICMSTot vNF'),
    valor_icms: g('ICMSTot vICMS'),
    valor_ipi: g('ICMSTot vIPI'),
    itens,
    xml_conteudo: xmlText,
  };
}

function NotasEntrada({tenantId,notasEntrada=[],cfopDepara=[],produtos=[],produtoDepara=[],reload,toast}){
  const [importando,setImportando]=useState(false);
  const [chave,setChave]=useState('');
  const [buscandoChave,setBuscandoChave]=useState(false);
  const [detalhe,setDetalhe]=useState(null);
  const [finalidade,setFinalidade]=useState('');
  const [cfopEscrit,setCfopEscrit]=useState('');
  const [salvandoEscrit,setSalvandoEscrit]=useState(false);
  const [vinculos,setVinculos]=useState({});
  const [modalProduto,setModalProduto]=useState(null);
  const [novoProd,setNovoProd]=useState(null);
  const [processandoEstoque,setProcessandoEstoque]=useState(false);
  function sugerirProduto(nota,item){const v=produtoDepara.find(d=>d.fornecedor_cnpj===nota.emit_cnpj&&d.codigo_fornecedor===item.codigo_fornecedor);return v?.produto_id||'';}
  function setVinculo(itemId,produtoId){setVinculos(p=>({...p,[itemId]:produtoId}));}

  // finalidades distintas conhecidas (das regras + as 4 padrão)
  const finalidadesPadrao=['Revenda','Matéria-prima','Consumo','Ativo imobilizado'];
  const finalidades=[...new Set([...finalidadesPadrao, ...cfopDepara.map(r=>r.finalidade)])];

  // Sugere CFOP de escrituração a partir do CFOP de origem do 1º item + finalidade
  function sugerirCfop(nota, fin){
    const cfopOrigem = nota.itens?.[0]?.cfop_origem || '';
    const regra = cfopDepara.find(r=>r.cfop_origem===cfopOrigem && r.finalidade===fin);
    return regra?.cfop_escrituracao || '';
  }
  function aoMudarFinalidade(fin){
    setFinalidade(fin);
    const sug = sugerirCfop(detalhe, fin);
    if(sug) setCfopEscrit(sug);
  }
  async function salvarEscrituracao(){
    if(!finalidade){toast('Selecione a finalidade da compra','error');return;}
    if(!cfopEscrit){toast('Informe o CFOP de escrituração','error');return;}
    setSalvandoEscrit(true);
    const {error}=await supabase.from('notas_entrada').update({
      finalidade_compra:finalidade, cfop_escrituracao:cfopEscrit, status:'escriturada',
    }).eq('id',detalhe.id);
    // aplica a todos os itens (conversão por nota inteira)
    await supabase.from('itens_entrada').update({cfop_escrituracao:cfopEscrit}).eq('nota_entrada_id',detalhe.id);
    setSalvandoEscrit(false);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast('Escrituração salva ✓','success');
    setDetalhe(null); reload();
  }

  async function processarEstoque(){
    const itens = detalhe.itens||[];
    const semVinculo = itens.filter(it=>!(vinculos[it.id]||sugerirProduto(detalhe,it)));
    if(semVinculo.length){ toast(semVinculo.length+' item(ns) sem produto vinculado. Vincule todos antes de dar entrada.','error'); return; }
    if(detalhe.estoque_processado){ toast('O estoque desta nota já foi processado.','info'); return; }
    setProcessandoEstoque(true);
    try{
      for(const it of itens){
        const prodId = vinculos[it.id] || sugerirProduto(detalhe,it);
        await supabase.from('produto_depara').upsert({
          tenant_id:tenantId, fornecedor_cnpj:detalhe.emit_cnpj, codigo_fornecedor:it.codigo_fornecedor,
          descricao_fornecedor:it.descricao, produto_id:prodId,
        }, {onConflict:'tenant_id,fornecedor_cnpj,codigo_fornecedor'});
        await supabase.from('itens_entrada').update({produto_id:prodId}).eq('id',it.id);
        const prod = produtos.find(p=>p.id===prodId);
        const novoEstoque = (Number(prod?.estoque_atual)||0) + (Number(it.quantidade)||0);
        await supabase.from('produtos').update({estoque_atual:novoEstoque}).eq('id',prodId);
      }
      await supabase.from('notas_entrada').update({estoque_processado:true, status:'escriturada'}).eq('id',detalhe.id);
      toast('Estoque atualizado e produtos vinculados ✓','success');
      setDetalhe(null); reload();
    }catch(e){ toast('Erro ao processar estoque: '+e.message,'error'); }
    setProcessandoEstoque(false);
  }

  async function criarProdutoRapido(){
    if(!novoProd.descricao||!novoProd.ncm){toast('Preencha descrição e NCM','error');return;}
    const {data,error}=await supabase.from('produtos').insert({
      tenant_id:tenantId, codigo:novoProd.codigo||null, descricao:novoProd.descricao, ncm:novoProd.ncm,
      cfop_padrao:'6102', unidade:novoProd.unidade||'UN', valor_unitario:parseFloat(novoProd.valor_unitario)||0,
      icms_cst:'00', icms_aliquota:12, estoque_atual:0,
    }).select().single();
    if(error){toast('Erro ao criar produto: '+error.message,'error');return;}
    setVinculo(modalProduto.id, data.id);
    toast('Produto criado e vinculado ✓','success');
    setModalProduto(null); setNovoProd(null);
    reload();
  }


  async function salvarNota(dados, origem){
    // Evita duplicar pela chave
    if(dados.chave_acesso){
      const {data:existe}=await supabase.from('notas_entrada').select('id')
        .eq('tenant_id',tenantId).eq('chave_acesso',dados.chave_acesso).maybeSingle();
      if(existe){ return {dup:true, numero:dados.numero}; }
    }
    const {data:nota,error}=await supabase.from('notas_entrada').insert({
      tenant_id:tenantId, chave_acesso:dados.chave_acesso||null,
      numero:dados.numero, serie:dados.serie, modelo:dados.modelo,
      natureza_operacao:dados.natureza_operacao, data_emissao:dados.data_emissao||null,
      emit_cnpj:dados.emit_cnpj, emit_razao_social:dados.emit_razao_social, emit_ie:dados.emit_ie,
      emit_uf:dados.emit_uf, emit_municipio:dados.emit_municipio, emit_codigo_municipio:dados.emit_codigo_municipio||null,
      valor_produtos:parseFloat(dados.valor_produtos)||0, valor_total:parseFloat(dados.valor_total)||0,
      valor_icms:parseFloat(dados.valor_icms)||0, valor_ipi:parseFloat(dados.valor_ipi)||0,
      origem, xml_conteudo:dados.xml_conteudo||null,
    }).select().single();
    if(error) throw error;
    if(dados.itens?.length){
      const itens=dados.itens.map(it=>({
        nota_entrada_id:nota.id, tenant_id:tenantId,
        numero_item:parseInt(it.numero_item)||null, codigo_fornecedor:it.codigo_fornecedor,
        descricao:it.descricao, ncm:it.ncm, cfop_origem:it.cfop_origem,
        unidade:it.unidade, quantidade:parseFloat(it.quantidade)||0,
        valor_unitario:parseFloat(it.valor_unitario)||0, valor_total:parseFloat(it.valor_total)||0,
        icms_cst:it.icms_cst, icms_valor:parseFloat(it.icms_valor)||0,
      }));
      await supabase.from('itens_entrada').insert(itens);
    }
    return {ok:true, numero:dados.numero};
  }

  async function onUpload(e){
    const files=Array.from(e.target.files||[]);
    if(!files.length) return;
    setImportando(true);
    let ok=0, dup=0, erro=0;
    for(const f of files){
      try{
        const texto=await f.text();
        const dados=parseNFeXML(texto);
        const r=await salvarNota(dados,'xml');
        if(r.dup) dup++; else ok++;
      }catch(err){ erro++; console.error('Erro no arquivo',f.name,err); }
    }
    setImportando(false);
    e.target.value='';
    toast(`Importação: ${ok} nova(s), ${dup} duplicada(s), ${erro} com erro.`, erro?'error':'success');
    reload();
  }

  async function buscarPorChave(){
    const ch=chave.replace(/\D/g,'');
    if(ch.length!==44){ toast('A chave de acesso deve ter 44 dígitos','error'); return; }
    setBuscandoChave(true);
    try{
      const r=await fetch('/api/importar-entrada',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chave:ch})
      });
      const d=await r.json();
      if(!d.ok){ toast(d.erro||'Não foi possível obter o XML por essa chave. Tente importar o arquivo XML.','error'); setBuscandoChave(false); return; }
      const dados=parseNFeXML(d.xml);
      const res=await salvarNota(dados,'chave');
      toast(res.dup?'Nota já estava importada':'Nota importada pela chave ✓', res.dup?'info':'success');
      setChave(''); reload();
    }catch(e){ toast('Erro ao buscar pela chave: '+e.message,'error'); }
    setBuscandoChave(false);
  }

  async function verDetalhe(n){
    const {data:itens}=await supabase.from('itens_entrada').select('*').eq('nota_entrada_id',n.id).order('numero_item');
    const nota={...n, itens:itens||[]};
    setDetalhe(nota);
    setFinalidade(n.finalidade_compra||'');
    setCfopEscrit(n.cfop_escrituracao||'');
  }
  async function excluir(id){
    if(!window.confirm('Excluir esta nota de entrada e seus itens?')) return;
    await supabase.from('itens_entrada').delete().eq('nota_entrada_id',id);
    const {error}=await supabase.from('notas_entrada').delete().eq('id',id);
    if(error){toast('Erro ao excluir: '+error.message,'error');return;}
    toast('Nota de entrada removida','info'); reload();
  }

  return (
    <div className="page">
      <PageHeader titulo="Notas de Entrada" sub={`${notasEntrada.length} importada(s)`}/>

      <div className="card card-pad" style={{marginBottom:16}}>
        <div className="form-grid form-grid-2" style={{gap:20}}>
          <div className="form-group">
            <label>Importar arquivo(s) XML</label>
            <input type="file" accept=".xml" multiple onChange={onUpload} disabled={importando}/>
            <span className="form-hint">Selecione um ou vários XMLs de NF-e dos fornecedores.</span>
          </div>
          <div className="form-group">
            <label>Ou registrar pela Chave de Acesso (44 dígitos)</label>
            <div style={{display:'flex',gap:8}}>
              <input style={{flex:1}} value={chave} onChange={e=>setChave(e.target.value.replace(/\D/g,'').slice(0,44))} placeholder="Chave da NF-e do fornecedor"/>
              <button className="btn btn-primary" onClick={buscarPorChave} disabled={buscandoChave}>{buscandoChave?'Buscando...':'Buscar'}</button>
            </div>
            <span className="form-hint">{chave.length}/44. A busca por chave depende da disponibilidade na SEFAZ.</span>
          </div>
        </div>
        {importando && <div className="alert alert-info" style={{marginTop:12}}>Importando arquivos, aguarde...</div>}
      </div>

      <div className="card card-pad">
        {notasEntrada.length===0? <div className="empty-state"><div className="empty-icon">📥</div><div className="empty-title">Nenhuma nota de entrada</div><div>Importe XMLs ou registre pela chave de acesso</div></div> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Nº/Série</th><th>Fornecedor</th><th>Emissão</th><th>Valor Total</th><th>Status</th><th></th></tr></thead>
          <tbody>{notasEntrada.map(n=>(
            <tr key={n.id}>
              <td className="mono">{n.numero}/{n.serie}</td>
              <td className="cell-strong">{n.emit_razao_social}<div style={{fontSize:11,color:'var(--text-3)'}} className="mono">{n.emit_cnpj}</div></td>
              <td className="mono">{fmt.data(n.data_emissao)}</td>
              <td className="mono">{fmt.moeda(n.valor_total)}</td>
              <td><span className="badge">{n.status}</span></td>
              <td><div style={{display:'flex',gap:6}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>verDetalhe(n)}>Ver</button>
                <button className="btn btn-danger btn-sm" onClick={()=>excluir(n.id)}>✕</button>
              </div></td>
            </tr>))}</tbody>
        </table></div>)}
      </div>

      {detalhe && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setDetalhe(null)}>
          <div className="modal">
            <div className="modal-header">
              <div><div className="modal-title">NF-e {detalhe.numero}/{detalhe.serie}</div>
                <div className="modal-sub">{detalhe.emit_razao_social}</div></div>
              <button className="modal-close" onClick={()=>setDetalhe(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14,fontSize:13}}>
                <div><b>Chave:</b> <span className="mono" style={{fontSize:11}}>{detalhe.chave_acesso||'—'}</span></div>
                <div><b>Natureza:</b> {detalhe.natureza_operacao}</div>
                <div><b>Emissão:</b> {fmt.data(detalhe.data_emissao)}</div>
                <div><b>UF:</b> {detalhe.emit_uf}</div>
                <div><b>Valor produtos:</b> {fmt.moeda(detalhe.valor_produtos)}</div>
                <div><b>Valor total:</b> {fmt.moeda(detalhe.valor_total)}</div>
              </div>
              <div className="table-wrap"><table>
                <thead><tr><th>Item</th><th>Descrição (fornecedor)</th><th>NCM</th><th>CFOP</th><th>Qtd</th><th>Produto no estoque</th></tr></thead>
                <tbody>{detalhe.itens.map(it=>{
                  const vinculoAtual = vinculos[it.id] ?? (it.produto_id || sugerirProduto(detalhe,it));
                  return (
                  <tr key={it.id}>
                    <td className="mono">{it.numero_item}</td>
                    <td>{it.descricao}<div style={{fontSize:11,color:'var(--text-3)'}} className="mono">{it.codigo_fornecedor}</div></td>
                    <td className="mono">{it.ncm}</td>
                    <td className="mono">{it.cfop_origem}</td>
                    <td className="mono">{Number(it.quantidade).toLocaleString('pt-BR')}</td>
                    <td>
                      {detalhe.estoque_processado ? <span style={{color:'var(--green-600)'}}>✓ vinculado</span> : (
                      <div style={{display:'flex',gap:4}}>
                        <select style={{flex:1,minWidth:160}} value={vinculoAtual} onChange={e=>setVinculo(it.id,e.target.value)}>
                          <option value="">— Selecione —</option>
                          {produtos.map(p=><option key={p.id} value={p.id}>{p.descricao}</option>)}
                        </select>
                        <button className="btn btn-ghost btn-sm" title="Criar produto novo" onClick={()=>{setModalProduto(it);setNovoProd({codigo:it.codigo_fornecedor,descricao:it.descricao,ncm:it.ncm,unidade:it.unidade,valor_unitario:it.valor_unitario});}}>+</button>
                      </div>)}
                    </td>
                  </tr>);})}</tbody>
              </table></div>
              {!detalhe.estoque_processado && (
                <div style={{marginTop:12,display:'flex',justifyContent:'flex-end'}}>
                  <button className="btn btn-primary" onClick={processarEstoque} disabled={processandoEstoque}>{processandoEstoque?'Processando...':'✓ Vincular produtos e dar entrada no estoque'}</button>
                </div>
              )}
              {detalhe.estoque_processado && <div style={{marginTop:10,fontSize:12,color:'var(--green-600)'}}>✓ Estoque já processado para esta nota.</div>}
              <div style={{marginTop:16,padding:'14px',background:'var(--blue-50)',borderRadius:10}}>
                <div style={{fontFamily:'var(--font-display)',fontWeight:700,color:'var(--blue-700)',marginBottom:10}}>Escrituração — Conversão de CFOP</div>
                <div style={{fontSize:12,color:'var(--text-2)',marginBottom:10}}>
                  CFOP de origem (fornecedor): <b className="mono">{detalhe.itens?.[0]?.cfop_origem||'—'}</b>. Escolha a finalidade da compra para sugerir o CFOP de escrituração.
                </div>
                <div className="form-grid form-grid-3" style={{gap:10}}>
                  <div className="form-group"><label>Finalidade da Compra</label>
                    <select value={finalidade} onChange={e=>aoMudarFinalidade(e.target.value)}>
                      <option value="">— Selecione —</option>
                      {finalidades.map(f=><option key={f} value={f}>{f}</option>)}
                    </select></div>
                  <div className="form-group"><label>CFOP de Escrituração</label>
                    <input value={cfopEscrit} onChange={e=>setCfopEscrit(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="Ex: 2102"/>
                    <span className="form-hint">Sugerido pela regra · ajustável.</span></div>
                  <div className="form-group" style={{display:'flex',alignItems:'flex-end'}}>
                    <button className="btn btn-primary" onClick={salvarEscrituracao} disabled={salvandoEscrit} style={{width:'100%'}}>{salvandoEscrit?'Salvando...':'Aplicar à nota'}</button>
                  </div>
                </div>
                {detalhe.cfop_escrituracao && <div style={{marginTop:8,fontSize:12,color:'var(--green-600)'}}>✓ Esta nota já está escriturada com CFOP {detalhe.cfop_escrituracao} ({detalhe.finalidade_compra}).</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {modalProduto && novoProd && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModalProduto(null)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <div><div className="modal-title">Criar produto no estoque</div><div className="modal-sub">A partir do item do fornecedor</div></div>
              <button className="modal-close" onClick={()=>setModalProduto(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group"><label>Código</label><input value={novoProd.codigo} onChange={e=>setNovoProd(p=>({...p,codigo:e.target.value}))}/></div>
                <div className="form-group"><label>Unidade</label><input value={novoProd.unidade} onChange={e=>setNovoProd(p=>({...p,unidade:e.target.value}))}/></div>
                <div className="form-group col-2"><label>Descrição *</label><input value={novoProd.descricao} onChange={e=>setNovoProd(p=>({...p,descricao:e.target.value}))}/></div>
                <div className="form-group"><label>NCM *</label><input value={novoProd.ncm} onChange={e=>setNovoProd(p=>({...p,ncm:e.target.value}))}/></div>
                <div className="form-group"><label>Valor unitário</label><input type="number" step="0.01" value={novoProd.valor_unitario} onChange={e=>setNovoProd(p=>({...p,valor_unitario:e.target.value}))}/></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setModalProduto(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={criarProdutoRapido}>Criar e vincular</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Helpers SPED (Bloco 0 — leiaute 020/2026) =====
function spedData(d){if(!d)return '';const dt=(d instanceof Date)?d:new Date(d+'T12:00:00');return String(dt.getDate()).padStart(2,'0')+String(dt.getMonth()+1).padStart(2,'0')+dt.getFullYear();}
function spedNum(v,casas=2){if(v===null||v===undefined||v==='')return '';const n=Number(v);if(isNaN(n))return '';return n.toFixed(casas).replace('.',',');}
function soDig(s){return (s||'').toString().replace(/\D/g,'');}
function arredEsp(n){return Math.round((Number(n)+Number.EPSILON)*100)/100;}
function spedLinha(campos){return '|'+campos.map(x=>(x===null||x===undefined)?'':String(x)).join('|')+'|';}

function SpedFiscal({tenantId,emitente,produtos=[],notasEntrada=[],notas=[],destinatarios=[],toast}){
  const hoje=new Date();
  const [ano,setAno]=useState(hoje.getFullYear());
  const [mes,setMes]=useState(hoje.getMonth()+1); // 1-12
  const [gerando,setGerando]=useState(false);
  const [previa,setPrevia]=useState('');

  async function gerar(){
    if(!emitente||!emitente.cnpj){toast('Configure os dados da empresa primeiro','error');return;}
    setGerando(true);
    try{
      const dataIni=new Date(ano,mes-1,1);
      const dataFim=new Date(ano,mes,0); // último dia do mês
      const iniStr=`${ano}-${String(mes).padStart(2,'0')}-01`;
      const fimStr=`${ano}-${String(mes).padStart(2,'0')}-${String(dataFim.getDate()).padStart(2,'0')}`;

      // Notas de entrada do período
      const {data:entradas}=await supabase.from('notas_entrada').select('*')
        .eq('tenant_id',tenantId).gte('data_emissao',iniStr).lte('data_emissao',fimStr);
      // Itens das entradas do período
      const idsEnt=(entradas||[]).map(e=>e.id);
      let itensEnt=[];
      if(idsEnt.length){
        const {data}=await supabase.from('itens_entrada').select('*').in('nota_entrada_id',idsEnt);
        itensEnt=data||[];
      }

      // Notas de SAÍDA (emitidas) autorizadas no período
      const {data:saidas}=await supabase.from('notas_fiscais').select('*')
        .eq('tenant_id',tenantId).gte('data_emissao',iniStr).lte('data_emissao',fimStr)
        .in('status',['autorizada','cancelada']);
      const idsSai=(saidas||[]).map(s=>s.id);
      let itensSai=[];
      if(idsSai.length){
        const {data}=await supabase.from('itens_nfe').select('*').in('nota_id',idsSai);
        itensSai=data||[];
      }

      // ---- Participantes (0150): fornecedores (entradas) + clientes (saídas) ----
      const partMap={};
      (entradas||[]).forEach(e=>{
        const cod=soDig(e.emit_cnpj);
        if(cod && !partMap[cod]){
          partMap[cod]={codPart:cod,nome:e.emit_razao_social,cnpj:e.emit_cnpj,
            codMun:soDig(e.emit_codigo_municipio),ie:e.emit_ie,
            endereco:'',numero:'',bairro:'',codPais:'1058'};
        }
      });
      (saidas||[]).forEach(s=>{
        const dest=destinatarios.find(d=>d.id===s.destinatario_id);
        const cod=soDig(dest?.cnpj_cpf);
        if(cod && !partMap[cod]){
          const ehCpf=cod.length===11;
          partMap[cod]={codPart:cod,nome:dest?.razao_social||s.destinatario_nome,
            cnpj:ehCpf?'':cod, cpf:ehCpf?cod:'', codMun:soDig(dest?.codigo_municipio),
            ie:dest?.ie, endereco:dest?.endereco||'', numero:dest?.numero||'', bairro:dest?.bairro||'',
            codPais:dest?.pais_codigo||'1058'};
        }
      });
      const participantes=Object.values(partMap);

      // ---- Unidades (0190): entradas + saídas + produtos ----
      const unidSet=new Set();
      itensEnt.forEach(i=>{if(i.unidade)unidSet.add(i.unidade.toUpperCase());});
      itensSai.forEach(i=>{if(i.unidade)unidSet.add(i.unidade.toUpperCase());});
      produtos.forEach(p=>{if(p.unidade)unidSet.add(p.unidade.toUpperCase());});
      if(unidSet.size===0)unidSet.add('UN');
      const unidades=[...unidSet].map(u=>({unid:u,descr:u}));

      // ---- Itens (0200): SOMENTE itens referenciados nos demais blocos ----
      // O guia exige que o 0200 contenha apenas produtos referenciados (C170 etc.).
      // Como NF-e de saída de emissão própria NÃO gera C170, apenas os itens de
      // ENTRADA (que geram C170) são referenciados e devem constar no 0200.
      // Produtos meramente cadastrados, sem movimento de entrada, ficam de fora
      // (senão o PVA acusa "item não referenciado em nenhum bloco").
      const itemMap={};
      function codItemEntrada(it){return it.codigo_fornecedor||('ENT'+(it.id||'').slice(0,6));}
      itensEnt.forEach(it=>{
        const cod=codItemEntrada(it);
        if(!itemMap[cod]){
          const p=produtos.find(x=>x.id===it.produto_id);
          itemMap[cod]={codigo:cod,descricao:it.descricao||(p&&p.descricao)||cod,
            unidade:(it.unidade||(p&&p.unidade)||'UN').toUpperCase(),tipo:'00',
            ncm:it.ncm||(p&&p.ncm),aliquota_icms:(p&&p.icms_aliquota)||0};
        }
      });
      const itens=Object.values(itemMap);

      // ---- Monta o arquivo ----
      const L=[];
      L.push(spedLinha(['0000','020','0',spedData(dataIni),spedData(dataFim),emitente.razao_social,
        soDig(emitente.cnpj),'',emitente.uf,soDig(emitente.ie),soDig(emitente.cod_municipio||emitente.codigo_municipio),'','','A','1']));
      // ===== Bloco 0 =====
      const B0=[];
      B0.push(spedLinha(['0001','0']));
      B0.push(spedLinha(['0005',emitente.nome_fantasia||emitente.razao_social,soDig(emitente.cep),
        emitente.endereco||'',emitente.numero||'',emitente.complemento||'',emitente.bairro||'',
        soDig(emitente.telefone),'',emitente.email||'']));
      // 0100 — dados do contabilista (se preenchido)
      if(emitente.cont_nome){
        B0.push(spedLinha(['0100',emitente.cont_nome,soDig(emitente.cont_cpf),emitente.cont_crc||'',
          soDig(emitente.cont_cnpj),soDig(emitente.cont_cep),emitente.cont_endereco||'',emitente.cont_numero||'',
          emitente.cont_complemento||'',emitente.cont_bairro||'',soDig(emitente.cont_telefone),'',
          emitente.cont_email||'',soDig(emitente.cont_cod_municipio)]));
      }
      participantes.forEach(p=>B0.push(spedLinha(['0150',p.codPart,p.nome,p.codPais,soDig(p.cnpj),
        soDig(p.cpf),soDig(p.ie),soDig(p.codMun),'',p.endereco,p.numero,'',p.bairro])));
      unidades.forEach(u=>B0.push(spedLinha(['0190',u.unid,u.descr])));
      itens.forEach(it=>B0.push(spedLinha(['0200',it.codigo,it.descricao,'','',it.unidade,it.tipo,
        soDig(it.ncm),'','','',spedNum(it.aliquota_icms,2),''])));
      // 0990 conta TODAS as linhas do bloco 0, incluindo o próprio 0990 E o registro 0000
      // (o 0000 está no array L, fora de B0, mas o leiaute exige somá-lo aqui).
      B0.push(spedLinha(['0990',B0.length+2]));

      // ===== Bloco C (documentos fiscais) =====
      // Acumuladores de ICMS para a apuração (Bloco E)
      const APUR={debito:0, credito:0}; // débito=saídas, crédito=entradas
      // Acumuladores analíticos por (CST+CFOP+aliq) p/ C190
      function montaC190(mapAnalitico){
        return Object.values(mapAnalitico).map(a=>spedLinha(['C190',a.cst,a.cfop,
          spedNum(a.aliq,2),spedNum(a.vlrOp,2),spedNum(a.bcIcms,2),spedNum(a.vlrIcms,2),
          spedNum(0,2),spedNum(0,2),spedNum(0,2),spedNum(0,2),'']));  // VL_BC_ICMS_ST,VL_ICMS_ST,VL_RED_BC,VL_IPI,COD_OBS
      }
      const BC=[];
      BC.push(spedLinha(['C001','0']));
      let countEnt=0, countSai=0, countSaiCancOmit=0, countSaiSemChave=0;

      // ENTRADAS (IND_OPER=0)
      (entradas||[]).forEach(e=>{
        const its=itensEnt.filter(i=>i.nota_entrada_id===e.id);
        const codPart=soDig(e.emit_cnpj);
        const chave=soDig(e.chave_acesso);
        // C100 (29 campos)
        BC.push(spedLinha(['C100','0','1',codPart,'55','00',e.serie||'',e.numero||'',chave,
          spedData(e.data_emissao),spedData(e.data_entrada||e.data_emissao),spedNum(e.valor_total,2),
          '0',spedNum(0,2),spedNum(0,2),spedNum(e.valor_produtos,2),'9',  // IND_PGTO,VL_DESC,VL_ABAT_NT,VL_MERC,IND_FRT
          spedNum(0,2),spedNum(0,2),spedNum(0,2),                          // VL_FRT,VL_SEG,VL_OUT_DA
          spedNum(e.valor_produtos,2),spedNum(e.valor_icms,2),            // VL_BC_ICMS,VL_ICMS
          spedNum(0,2),spedNum(0,2),spedNum(e.valor_ipi,2),               // BC_ST,ICMS_ST,IPI
          spedNum(0,2),spedNum(0,2),spedNum(0,2),spedNum(0,2)]));          // PIS,COFINS,PIS_ST,COFINS_ST
        const analit={};
        its.forEach((it,idx)=>{
          const cfop=it.cfop_escrituracao||it.cfop_origem||'';
          const cst=(it.icms_cst||'00').padStart(3,'0');
          const cod=codItemEntrada(it);
          const bcIcms=Number(it.valor_total)||0;
          const vIcms=Number(it.icms_valor)||0;
          const aliq=bcIcms>0?(vIcms/bcIcms*100):0;
          // C170
          // C170 (38 campos). PIS/COFINS dispensados na EFD ICMS/IPI => vazios.
          BC.push(spedLinha(['C170',idx+1,cod,'',spedNum(it.quantidade,4),(it.unidade||'UN').toUpperCase(),
            spedNum(it.valor_total,2),spedNum(0,2),'0',cst,cfop,'',   // 7-12
            spedNum(bcIcms,2),spedNum(aliq,2),spedNum(vIcms,2),         // 13-15
            spedNum(0,2),spedNum(0,2),spedNum(0,2),                     // 16-18
            '','','',spedNum(0,2),spedNum(0,2),spedNum(0,2),            // 19-24
            '','','','','','',                                         // 25-30 PIS
            '','','','','','',                                         // 31-36 COFINS
            '',spedNum(0,2)]));                                        // 37-38 COD_CTA,VL_ABAT_NT
          // analítico
          const k=cst+'|'+cfop+'|'+aliq.toFixed(2);
          if(!analit[k])analit[k]={cst,cfop,aliq,vlrOp:0,bcIcms:0,vlrIcms:0};
          analit[k].vlrOp+=Number(it.valor_total)||0;
          analit[k].bcIcms+=bcIcms; analit[k].vlrIcms+=vIcms;
          APUR.credito+=vIcms;
        });
        montaC190(analit).forEach(l=>BC.push(l));
        countEnt++;
      });

      // SAÍDAS (IND_OPER=1)
      (saidas||[]).forEach(s=>{
        const its=itensSai.filter(i=>i.nota_id===s.id);
        const dest=destinatarios.find(d=>d.id===s.destinatario_id);
        const codPart=soDig(dest?.cnpj_cpf);
        const cancelada=s.status==='cancelada';
        const codSit=cancelada?'02':'00'; // 02 = cancelado
        // CHV_NFE: 44 dígitos da NF-e autorizada, ou vazio. Nunca o focus_ref (ref. interna).
        const chvSaida = (soDig(s.chave_acesso).length===44) ? soDig(s.chave_acesso) : '';

        if(cancelada){
          // Documento cancelado exige CHV_NFE. Sem chave de 44 dígitos (ex.: notas de
          // homologação), a nota é fiscalmente inválida no SPED — então é omitida.
          // Com chave, informa-se SOMENTE os campos mínimos: COD_SIT, IND_OPER,
          // IND_EMIT, COD_MOD e CHV_NFE. Todos os demais campos vazios. Sem C170/C190.
          if(!chvSaida){ countSaiCancOmit++; return; }
          BC.push(spedLinha(['C100','1','0','','55','02','','',chvSaida,
            '','','','','','','','','','','','','','','','','','','','']));
          countSai++;
          return;
        }

        // NF-e modelo 55 de emissão própria exige CHV_NFE (44 dígitos) em todas as
        // situações. Sem chave válida (ex.: notas de homologação), a nota não é aceita
        // pelo PVA — então é omitida. Em produção, com chave real, entra normalmente.
        if(!chvSaida){ countSaiSemChave++; return; }

        // C100 regular (29 campos). VL_ICMS preenchido para bater com a soma do C190.
        const totIcmsNota = its.reduce((s2,it)=>s2 + (Number(it.valor_total)||0)*(Number(it.icms_aliquota)||0)/100, 0);
        BC.push(spedLinha(['C100','1','0',codPart,'55',codSit,s.serie||'',s.numero||'',chvSaida,
          spedData(s.data_emissao),spedData(s.data_emissao),spedNum(s.valor_total,2),
          '0',spedNum(0,2),spedNum(0,2),spedNum(s.valor_produtos,2),'9',  // IND_PGTO,VL_DESC,VL_ABAT_NT,VL_MERC,IND_FRT
          spedNum(0,2),spedNum(0,2),spedNum(0,2),                          // VL_FRT,VL_SEG,VL_OUT_DA
          spedNum(s.valor_produtos,2),spedNum(arredEsp(totIcmsNota),2),    // VL_BC_ICMS,VL_ICMS
          spedNum(0,2),spedNum(0,2),spedNum(0,2),                          // BC_ST,ICMS_ST,IPI
          spedNum(0,2),spedNum(0,2),spedNum(0,2),spedNum(0,2)]));          // PIS,COFINS,PIS_ST,COFINS_ST

        // NF-e modelo 55 de emissão própria: dispensado o C170. Informar só C100 + C190.
        // O analítico do C190 é montado direto a partir dos itens.
        const analit={};
        its.forEach((it)=>{
          const cfop=it.cfop||s.cfop||'';
          const cst=(it.icms_cst||'00').padStart(3,'0');
          const bcIcms=Number(it.valor_total)||0;
          const aliq=Number(it.icms_aliquota)||0;
          const vIcms=bcIcms*aliq/100;
          const k=cst+'|'+cfop+'|'+aliq.toFixed(2);
          if(!analit[k])analit[k]={cst,cfop,aliq,vlrOp:0,bcIcms:0,vlrIcms:0};
          analit[k].vlrOp+=bcIcms; analit[k].bcIcms+=bcIcms; analit[k].vlrIcms+=vIcms;
          APUR.debito+=vIcms;
        });
        montaC190(analit).forEach(l=>BC.push(l));
        countSai++;
      });

      BC.push(spedLinha(['C990',BC.length+1]));

      // ===== Bloco E (apuração do ICMS) =====
      // E110: saldo apurado. Débito (saídas) - Crédito (entradas).
      const deb=arredEsp(APUR.debito);
      const cred=arredEsp(APUR.credito);
      const saldoDevedor=Math.max(deb-cred,0);   // VL_SLD_APURADO devedor
      const saldoCredor=Math.max(cred-deb,0);    // saldo credor a transportar
      const BE=[];
      BE.push(spedLinha(['E001','0']));
      // E100: período de apuração (mês)
      BE.push(spedLinha(['E100',spedData(dataIni),spedData(dataFim)]));
      // E110: apuração do ICMS — operações próprias
      // Campos: VL_TOT_DEBITOS, VL_AJ_DEBITOS, VL_TOT_AJ_DEBITOS, VL_ESTORNOS_CRED,
      // VL_TOT_CREDITOS, VL_AJ_CREDITOS, VL_TOT_AJ_CREDITOS, VL_ESTORNOS_DEB,
      // VL_SLD_CREDOR_ANT, VL_SLD_APURADO, VL_TOT_DED, VL_ICMS_RECOLHER, VL_SLD_CREDOR_TRANSPORTAR, DEB_ESP
      BE.push(spedLinha(['E110',
        spedNum(deb,2), spedNum(0,2), spedNum(0,2), spedNum(0,2),
        spedNum(cred,2), spedNum(0,2), spedNum(0,2), spedNum(0,2),
        spedNum(0,2), spedNum(saldoDevedor,2), spedNum(0,2),
        spedNum(saldoDevedor,2), spedNum(saldoCredor,2), spedNum(0,2)]));
      // E116: obrigação do ICMS a recolher. Obrigatório quando há saldo devedor.
      // A soma do VL_OR deve ser igual a VL_ICMS_RECOLHER + DEB_ESP do E110.
      // COD_OR=000 (ICMS apuração normal). COD_REC e DT_VCTO dependem da UF do
      // contribuinte (tabela de código de receita estadual) — ajustar com o contador.
      // Campos: COD_OR, VL_OR, DT_VCTO, COD_REC, NUM_PROC, IND_PROC, PROC, TXT_COMPL, MES_REF
      if(saldoDevedor>0){
        const dtVcto = spedData(dataFim);                 // venc. padrão = fim do período (ajustar c/ contador)
        const codRec = '000000';                          // código de receita da UF (ajustar c/ contador)
        const mesRef = String(dataIni.getMonth()+1).padStart(2,'0') + dataIni.getFullYear();
        BE.push(spedLinha(['E116','000',spedNum(saldoDevedor,2),dtVcto,codRec,'','','','',mesRef]));
      }
      BE.push(spedLinha(['E990',BE.length+1]));

      // ===== Blocos obrigatórios sem movimento (abertura+encerramento) =====
      // Ordem oficial dos blocos: 0, B, C, D, E, G, H, K, 1, 9.
      // Cada bloco ausente precisa do registro de abertura com IND_MOV=1 (sem dados)
      // e o de encerramento contando 2 linhas. Sem isso o PVA acusa
      // "registro encontrado é diferente do registro esperado".
      const blocoVazio=(abre,fecha)=>[spedLinha([abre,'1']),spedLinha([fecha,'2'])];
      const BB=blocoVazio('B001','B990'); // ISS (DF)
      const BD=blocoVazio('D001','D990'); // serviços transporte/comunicação
      const BG=blocoVazio('G001','G990'); // CIAP
      const BH=blocoVazio('H001','H990'); // inventário
      const BK=blocoVazio('K001','K990'); // produção/estoque
      const B1=blocoVazio('1001','1990'); // outras informações

      // ===== Bloco 9 (controle e encerramento) =====
      // Conta quantos registros de cada tipo existem no arquivo inteiro.
      // O Bloco 9 precisa contar a si mesmo, então montamos em etapas.
      const corpo=[...L,...B0,...BB,...BC,...BD,...BE,...BG,...BH,...BK,...B1]; // tudo, menos o bloco 9

      // conta registros do corpo por tipo
      function contaTipos(linhas){
        const m={};
        linhas.forEach(l=>{
          const tipo=l.split('|')[1];
          m[tipo]=(m[tipo]||0)+1;
        });
        return m;
      }
      const cont=contaTipos(corpo);

      // Os tipos do próprio Bloco 9 que vão existir: 9001, 9900 (vários), 9990, 9999
      // Quantidade de registros 9900 = tipos do corpo + tipos do bloco 9.
      // Tipos do bloco 9 que aparecem no 9900: 9001, 9900, 9990, 9999 = 4 tipos fixos.
      const tiposCorpo=Object.keys(cont);
      // monta os 9900 do corpo
      const linhas9900=[];
      tiposCorpo.forEach(t=> linhas9900.push({tipo:t, qtd:cont[t]}));
      // adiciona os 9900 referentes ao próprio bloco 9
      // 9001:1, 9990:1, 9999:1, e 9900: (total de 9900)
      const totalTipos9900 = linhas9900.length + 4; // +9001,+9900,+9990,+9999
      linhas9900.push({tipo:'9001', qtd:1});
      linhas9900.push({tipo:'9900', qtd:totalTipos9900});
      linhas9900.push({tipo:'9990', qtd:1});
      linhas9900.push({tipo:'9999', qtd:1});

      // Monta o bloco 9 em texto
      const B9=[];
      B9.push(spedLinha(['9001','0']));
      linhas9900.forEach(r=> B9.push(spedLinha(['9900', r.tipo, r.qtd])));
      // 9990 = QTD_LIN_9: total de linhas do bloco 9, incluindo o próprio 9990
      // E o 9999 (que ainda será adicionado depois). Por isso +2.
      B9.push(spedLinha(['9990', B9.length + 2]));

      // junta tudo e fecha com 9999 (total de linhas do arquivo)
      const todasSem9999=[...corpo, ...B9];
      const total9999=todasSem9999.length + 1; // +1 = o próprio 9999
      const todas=[...todasSem9999, spedLinha(['9999', total9999])];

      const conteudo=todas.join('\r\n')+'\r\n';
      setPrevia(conteudo);
      toast(`SPED completo: ${countEnt} entrada(s), ${countSai} saída(s)${countSaiCancOmit?`, ${countSaiCancOmit} cancelada(s) sem chave omitida(s)`:''}${countSaiSemChave?`, ${countSaiSemChave} saída(s) sem chave omitida(s)`:''}, ${total9999} linhas. ICMS déb ${arredEsp(APUR.debito).toFixed(2)} / créd ${arredEsp(APUR.credito).toFixed(2)}.`,'success');
    }catch(e){toast('Erro ao gerar: '+e.message,'error');}
    setGerando(false);
  }

  function baixar(){
    if(!previa){toast('Gere o arquivo primeiro','error');return;}
    const blob=new Blob([previa],{type:'text/plain;charset=iso-8859-1'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=`SPED_${ano}_${String(mes).padStart(2,'0')}.txt`;
    a.click(); URL.revokeObjectURL(url);
  }

  const meses=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  return (
    <div className="page">
      <PageHeader titulo="SPED Fiscal (EFD ICMS/IPI)" sub="Leiaute 020 · Perfil A · Arquivo completo (0, C, E, 9)"/>
      <div className="alert alert-info" style={{marginBottom:16}}>
        ✅ Gera o arquivo SPED <b>completo</b> (blocos 0, C, E e 9), pronto para validar no <b>PVA 6.0.0+</b> da Receita (versão exigida para o leiaute 020). O PVA pode apontar ajustes finos — é normal; me traga as mensagens que ajustamos.
      </div>
      <div className="card card-pad" style={{marginBottom:16}}>
        <div className="form-grid form-grid-3" style={{gap:14,alignItems:'end'}}>
          <div className="form-group"><label>Mês de apuração</label>
            <select value={mes} onChange={e=>setMes(Number(e.target.value))}>
              {meses.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
            </select></div>
          <div className="form-group"><label>Ano</label>
            <input type="number" value={ano} onChange={e=>setAno(Number(e.target.value))}/></div>
          <div className="form-group" style={{display:'flex',gap:8}}>
            <button className="btn btn-primary" onClick={gerar} disabled={gerando} style={{flex:1}}>{gerando?'Gerando...':'Gerar Bloco 0'}</button>
            {previa && <button className="btn btn-ghost" onClick={baixar}>Baixar .txt</button>}
          </div>
        </div>
      </div>
      {previa && (
        <div className="card card-pad">
          <div style={{fontWeight:700,marginBottom:10,fontFamily:'var(--font-display)'}}>Prévia do arquivo</div>
          <pre style={{background:'var(--bg-2)',padding:14,borderRadius:8,fontSize:11,overflow:'auto',maxHeight:400,fontFamily:'var(--font-mono)',lineHeight:1.6}}>{previa}</pre>
        </div>
      )}
    </div>
  );
}

function VendasStoneBlock({tenantId,vendas=[],reload,toast,goToEmissao}){
  const [importando,setImportando]=useState(false);
  const [detalhe,setDetalhe]=useState(null);
  const filtro=['pendente','emitida','descartada'];
  const [aba,setAba]=useState('pendente');

  // Importa um ou vários JSONs de venda do Stone Block
  async function onUpload(e){
    const files=Array.from(e.target.files||[]);
    if(!files.length) return;
    setImportando(true);
    let ok=0, dup=0, erro=0;
    for(const f of files){
      try{
        const texto=await f.text();
        const d=JSON.parse(texto);
        // evita duplicar pela sb_venda_id
        if(d.sb_venda_id){
          const {data:existe}=await supabase.from('vendas_stoneblock').select('id')
            .eq('tenant_id',tenantId).eq('sb_venda_id',d.sb_venda_id).maybeSingle();
          if(existe){dup++;continue;}
        }
        const cli=d.cliente||{};
        const valorTotal=(d.itens||[]).reduce((s,it)=>s+(Number(it.quantidade)||0)*(Number(it.valor_unitario)||0),0);
        const {error}=await supabase.from('vendas_stoneblock').insert({
          tenant_id:tenantId, sb_venda_id:d.sb_venda_id||null, sb_pedido_numero:d.sb_pedido_numero||null,
          cliente_nome:cli.nome, cliente_cnpj_cpf:cli.cnpj_cpf, cliente_ie:cli.ie,
          cliente_endereco:cli.endereco, cliente_numero:cli.numero, cliente_bairro:cli.bairro,
          cliente_municipio:cli.municipio, cliente_uf:cli.uf, cliente_cep:cli.cep, cliente_email:cli.email,
          data_venda:d.data_venda||null, valor_total:valorTotal, observacoes:d.observacoes||null,
          itens:d.itens||[], payload_original:d, status:'pendente', origem:'json',
        });
        if(error){erro++;console.error(error);}else{ok++;}
      }catch(err){erro++;console.error('Erro no arquivo',f.name,err);}
    }
    setImportando(false); e.target.value='';
    toast(`Importação: ${ok} nova(s), ${dup} duplicada(s), ${erro} com erro.`, erro?'error':'success');
    reload();
  }

  async function descartar(id){
    if(!window.confirm('Descartar esta venda? Ela sairá da lista de pendentes.')) return;
    const {error}=await supabase.from('vendas_stoneblock').update({status:'descartada'}).eq('id',id);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast('Venda descartada','info'); reload();
  }

  function emitir(v){
    // Leva os dados da venda para a tela de emissão (rascunho)
    if(goToEmissao) goToEmissao(v);
  }

  const lista=vendas.filter(v=>(v.status||'pendente')===aba);
  const fmtMoeda=(x)=>(Number(x)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const fmtData=(x)=>x?new Date(x+'T12:00:00').toLocaleDateString('pt-BR'):'-';

  return (
    <div className="page">
      <PageHeader titulo="Vendas do Stone Block" sub="Vendas recebidas do Stone Block para emissão de NF-e"/>

      <div className="card card-pad" style={{marginBottom:16}}>
        <div className="form-group">
          <label>Importar venda(s) do Stone Block (arquivo JSON)</label>
          <input type="file" accept=".json" multiple onChange={onUpload} disabled={importando}/>
          <span className="form-hint">Selecione um ou vários arquivos .json exportados do Stone Block. Em breve isso será automático.</span>
        </div>
        {importando && <div className="alert alert-info" style={{marginTop:12}}>Importando, aguarde...</div>}
      </div>

      <div className="tabs">{filtro.map(k=>(
        <button key={k} className={`tab ${aba===k?'active':''}`} onClick={()=>setAba(k)}>
          {k==='pendente'?'Pendentes':k==='emitida'?'Emitidas':'Descartadas'}
          {' '}({vendas.filter(v=>(v.status||'pendente')===k).length})
        </button>))}
      </div>

      <div className="card card-pad">
        {lista.length===0? <div className="empty-state"><div className="empty-icon">🧱</div><div className="empty-title">Nenhuma venda {aba==='pendente'?'pendente':aba}</div><div>Importe um JSON do Stone Block para começar</div></div> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Itens</th><th>Valor</th><th></th></tr></thead>
          <tbody>{lista.map(v=>(
            <tr key={v.id}>
              <td className="mono">{v.sb_pedido_numero||v.sb_venda_id||'—'}</td>
              <td className="cell-strong">{v.cliente_nome}<div style={{fontSize:11,color:'var(--text-3)'}} className="mono">{v.cliente_cnpj_cpf}</div></td>
              <td className="mono">{fmtData(v.data_venda)}</td>
              <td className="mono">{(v.itens||[]).length}</td>
              <td className="mono">{fmtMoeda(v.valor_total)}</td>
              <td><div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>setDetalhe(v)}>Ver</button>
                {aba==='pendente' && <>
                  <button className="btn btn-primary btn-sm" onClick={()=>emitir(v)}>Emitir NF-e</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>descartar(v.id)}>✕</button>
                </>}
              </div></td>
            </tr>))}</tbody>
        </table></div>)}
      </div>

      {detalhe && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setDetalhe(null)}>
          <div className="modal">
            <div className="modal-header">
              <div><div className="modal-title">Pedido {detalhe.sb_pedido_numero||detalhe.sb_venda_id}</div>
                <div className="modal-sub">{detalhe.cliente_nome}</div></div>
              <button className="modal-close" onClick={()=>setDetalhe(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14,fontSize:13}}>
                <div><b>CNPJ/CPF:</b> {detalhe.cliente_cnpj_cpf||'—'}</div>
                <div><b>IE:</b> {detalhe.cliente_ie||'—'}</div>
                <div><b>Município:</b> {detalhe.cliente_municipio}/{detalhe.cliente_uf}</div>
                <div><b>Data:</b> {fmtData(detalhe.data_venda)}</div>
              </div>
              <div className="table-wrap"><table>
                <thead><tr><th>Descrição</th><th>NCM</th><th>CFOP</th><th>Qtd</th><th>Vlr Unit.</th><th>Total</th></tr></thead>
                <tbody>{(detalhe.itens||[]).map((it,i)=>(
                  <tr key={i}>
                    <td>{it.descricao}</td>
                    <td className="mono">{it.ncm}</td>
                    <td className="mono">{it.cfop||'—'}</td>
                    <td className="mono">{Number(it.quantidade).toLocaleString('pt-BR')}</td>
                    <td className="mono">{fmtMoeda(it.valor_unitario)}</td>
                    <td className="mono">{fmtMoeda((Number(it.quantidade)||0)*(Number(it.valor_unitario)||0))}</td>
                  </tr>))}</tbody>
              </table></div>
              {detalhe.observacoes && <div style={{marginTop:12,fontSize:13}}><b>Obs:</b> {detalhe.observacoes}</div>}
              {detalhe.status==='pendente' && <div style={{marginTop:16,display:'flex',justifyContent:'flex-end'}}>
                <button className="btn btn-primary" onClick={()=>{setDetalhe(null);emitir(detalhe);}}>Emitir NF-e desta venda</button>
              </div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Transportadores({tenantId,transportadores=[],reload,toast}){
  const [modal,setModal]=useState(false);
  const [editId,setEditId]=useState(null);
  const [saving,setSaving]=useState(false);
  const vazio={nome:'',cnpj_cpf:'',telefone:''};
  const [form,setForm]=useState(vazio);

  function novo(){setForm(vazio);setEditId(null);setModal(true);}
  function editar(t){setForm({nome:t.nome||'',cnpj_cpf:t.cnpj_cpf||'',telefone:t.telefone||''});setEditId(t.id);setModal(true);}

  async function salvar(){
    if(!form.nome){toast('Informe o nome do transportador','error');return;}
    if(form.cnpj_cpf && !validaDoc(form.cnpj_cpf)){toast('CNPJ/CPF inválido','error');return;}
    setSaving(true);
    const payload={tenant_id:tenantId,nome:form.nome,cnpj_cpf:form.cnpj_cpf||null,telefone:form.telefone||null};
    let error;
    if(editId){({error}=await supabase.from('transportadores').update(payload).eq('id',editId));}
    else{({error}=await supabase.from('transportadores').insert(payload));}
    setSaving(false);
    if(error){toast('Erro ao salvar: '+error.message,'error');return;}
    toast(editId?'Transportador atualizado':'Transportador cadastrado','success');
    setModal(false);reload();
  }
  async function excluir(id){
    const {error}=await supabase.from('transportadores').delete().eq('id',id);
    if(error){toast('Erro ao excluir: '+error.message,'error');return;}
    toast('Transportador removido','info');reload();
  }

  return (
    <div className="page">
      <PageHeader titulo="Transportadores" sub={`${transportadores.length} cadastrados`}
        acao={<button className="btn btn-primary" onClick={novo}>+ Novo Transportador</button>}/>
      <div className="card card-pad">
        {transportadores.length===0? <div className="empty-state"><div className="empty-icon">🚚</div><div className="empty-title">Nenhum transportador</div><div>Cadastre as transportadoras que você utiliza</div></div> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Nome</th><th>CNPJ/CPF</th><th>Telefone</th><th></th></tr></thead>
          <tbody>{transportadores.map(t=>(
            <tr key={t.id}>
              <td className="cell-strong">{t.nome}</td>
              <td className="mono">{t.cnpj_cpf||'—'}</td>
              <td className="mono">{t.telefone||'—'}</td>
              <td><div style={{display:'flex',gap:6}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>editar(t)}>✎ Editar</button>
                <button className="btn btn-danger btn-sm" onClick={()=>excluir(t.id)}>✕</button>
              </div></td>
            </tr>))}</tbody>
        </table></div>)}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <div><div className="modal-title">{editId?'Editar':'Novo'} Transportador</div><div className="modal-sub">Dados básicos</div></div>
              <button className="modal-close" onClick={()=>setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group col-2"><label>Nome / Razão Social *</label>
                  <input value={form.nome} onChange={e=>setForm(p=>({...p,nome:e.target.value}))} placeholder="Nome da transportadora"/></div>
                <div className="form-group"><label>CNPJ / CPF</label>
                  <input value={form.cnpj_cpf} onChange={e=>setForm(p=>({...p,cnpj_cpf:e.target.value}))} placeholder="Somente números"/></div>
                <div className="form-group"><label>Telefone</label>
                  <input value={form.telefone} onChange={e=>setForm(p=>({...p,telefone:e.target.value}))} placeholder="(00) 00000-0000"/></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvar} disabled={saving}>{saving?'Salvando...':'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Destinatarios({tenantId,destinatarios,reload,toast}){
  const [modal,setModal]=useState(false);
  const [editId,setEditId]=useState(null);
  const [saving,setSaving]=useState(false);
  const vazio={tipo:'J',indicador_ie:'1',estrangeiro:false,pais_codigo:'1058',pais_nome:'BRASIL',razao_social:'',cnpj_cpf:'',ie:'',endereco:'',numero:'',bairro:'',municipio:'',uf:'SP',cep:'',email:''};
  const [form,setForm]=useState(vazio);

  function novo(){setForm(vazio);setEditId(null);setModal(true);}
  function editar(d){setForm({...d});setEditId(d.id);setModal(true);}

  async function salvar(){
    if(!form.razao_social){toast('Preencha a razão social','error');return;}
    if(form.estrangeiro){
      // Cliente do exterior: sem CNPJ/IE, UF=EX, município=EXTERIOR
      if(!form.endereco){toast('Preencha o endereço do cliente estrangeiro','error');return;}
      if(!form.pais_codigo){toast('Selecione o país','error');return;}
    } else {
      if(!form.cnpj_cpf){toast('Preencha o CNPJ/CPF','error');return;}
      if(!validaDoc(form.cnpj_cpf)){toast('CNPJ/CPF inválido — confira os números','error');return;}
      if(form.cep && !validaCEP(form.cep)){toast('CEP inválido (precisa ter 8 dígitos)','error');return;}
    }
    setSaving(true);
    const pais = PAISES.find(p=>p.codigo===form.pais_codigo);
    const payload={tenant_id:tenantId,tipo:form.tipo,estrangeiro:!!form.estrangeiro,
      indicador_ie:form.estrangeiro?'9':form.indicador_ie,
      pais_codigo:form.estrangeiro?form.pais_codigo:'1058',
      pais_nome:form.estrangeiro?(pais?.nome||form.pais_nome):'BRASIL',
      razao_social:form.razao_social,
      cnpj_cpf:form.estrangeiro?null:form.cnpj_cpf,
      ie:form.estrangeiro?null:form.ie,
      endereco:form.endereco,numero:form.numero,bairro:form.bairro,
      municipio:form.estrangeiro?'EXTERIOR':form.municipio,
      uf:form.estrangeiro?'EX':form.uf,
      cep:form.estrangeiro?null:form.cep,email:form.email};
    let error;
    if(editId){({error}=await supabase.from('destinatarios').update(payload).eq('id',editId));}
    else{({error}=await supabase.from('destinatarios').insert(payload));}
    setSaving(false);
    if(error){toast('Erro ao salvar: '+error.message,'error');return;}
    toast(editId?'Cliente atualizado':'Cliente cadastrado','success');
    setModal(false);reload();
  }
  async function excluir(id){
    const {error}=await supabase.from('destinatarios').delete().eq('id',id);
    if(error){toast('Erro ao excluir: '+error.message,'error');return;}
    toast('Cliente removido','info');reload();
  }

  return (
    <div className="page">
      <PageHeader titulo="Clientes" sub={`${destinatarios.length} cadastrados`}
        acao={<button className="btn btn-primary" onClick={novo}>+ Novo Cliente</button>}/>
      <div className="card card-pad">
        {destinatarios.length===0? <div className="empty-state"><div className="empty-icon">🏭</div><div className="empty-title">Nenhum cliente</div><div>Cadastre seus clientes (indústrias compradoras)</div></div> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Razão Social</th><th>CNPJ/CPF</th><th>IE</th><th>Município/UF</th><th>E-mail</th><th></th></tr></thead>
          <tbody>{destinatarios.map(d=>(
            <tr key={d.id}>
              <td className="cell-strong">{d.razao_social}</td>
              <td className="mono">{d.cnpj_cpf}</td>
              <td className="mono">{d.ie||'—'}</td>
              <td>{d.municipio}/{d.uf}</td>
              <td style={{fontSize:12,color:'var(--text-3)'}}>{d.email}</td>
              <td><div style={{display:'flex',gap:6}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>editar(d)}>✎ Editar</button>
                <button className="btn btn-danger btn-sm" onClick={()=>excluir(d.id)}>✕</button>
              </div></td>
            </tr>))}</tbody>
        </table></div>)}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div><div className="modal-title">{editId?'Editar':'Novo'} Cliente</div><div className="modal-sub">Indústria ou comprador</div></div>
              <button className="modal-close" onClick={()=>setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid form-grid-2" style={{gap:14}}>
                <div className="form-group col-2" style={{background:'var(--blue-50)',padding:'10px 12px',borderRadius:8}}>
                  <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',margin:0}}>
                    <input type="checkbox" checked={!!form.estrangeiro} onChange={e=>setForm(p=>({...p,estrangeiro:e.target.checked}))} style={{width:'auto'}}/>
                    Cliente do exterior (exportação)
                  </label>
                </div>

                {form.estrangeiro ? <>
                  <div className="form-group col-2"><label>Razão Social / Nome</label>
                    <input value={form.razao_social} onChange={e=>setForm(p=>({...p,razao_social:e.target.value}))} placeholder="Nome do importador"/></div>
                  <div className="form-group"><label>País</label>
                    <select value={form.pais_codigo} onChange={e=>setForm(p=>({...p,pais_codigo:e.target.value}))}>
                      {PAISES.filter(p=>p.codigo!=='1058').map(p=><option key={p.codigo} value={p.codigo}>{p.nome}</option>)}
                    </select></div>
                  <div className="form-group"><label>E-mail</label>
                    <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="email@empresa.com"/></div>
                  <div className="divider col-2"/>
                  <div className="form-group col-2"><label>Endereço (logradouro)</label>
                    <input value={form.endereco} onChange={e=>setForm(p=>({...p,endereco:e.target.value}))} placeholder="Rua / via no exterior"/></div>
                  <div className="form-group"><label>Número</label>
                    <input value={form.numero} onChange={e=>setForm(p=>({...p,numero:e.target.value}))} placeholder="Nº ou S/N"/></div>
                  <div className="form-group"><label>Bairro / Cidade estrangeira</label>
                    <input value={form.bairro} onChange={e=>setForm(p=>({...p,bairro:e.target.value}))} placeholder="Ex: Shanghai"/></div>
                  <div className="form-group col-2"><span className="form-hint">Para o exterior, UF = EX e Município = EXTERIOR são aplicados automaticamente. CNPJ/CPF e IE não são informados.</span></div>
                </> : <>
                  <div className="form-group"><label>Tipo de Pessoa</label>
                    <select value={form.tipo} onChange={e=>setForm(p=>({...p,tipo:e.target.value}))}>
                      <option value="J">Jurídica (CNPJ)</option><option value="F">Física (CPF)</option></select></div>
                  <div className="form-group"><label>Tipo de Contribuinte</label>
                    <select value={form.indicador_ie} onChange={e=>setForm(p=>({...p,indicador_ie:e.target.value}))}>
                      <option value="1">1 - Contribuinte ICMS (IE normal)</option>
                      <option value="2">2 - Contribuinte isento de IE</option>
                      <option value="9">9 - Não contribuinte</option>
                    </select></div>
                  <div className="form-group"><label>{form.tipo==='J'?'CNPJ':'CPF'}</label>
                    <input value={form.cnpj_cpf} onChange={e=>setForm(p=>({...p,cnpj_cpf:form.tipo==='J'?maskCNPJ(e.target.value):e.target.value}))} placeholder={form.tipo==='J'?'00.000.000/0000-00':'000.000.000-00'}/></div>
                  <div className="form-group col-2"><label>Razão Social / Nome</label>
                    <input value={form.razao_social} onChange={e=>setForm(p=>({...p,razao_social:e.target.value}))} placeholder="Razão social ou nome completo"/></div>
                  <div className="form-group"><label>Inscrição Estadual</label>
                    <input value={form.ie} onChange={e=>setForm(p=>({...p,ie:e.target.value}))} placeholder="Ou ISENTO"/></div>
                  <div className="form-group"><label>E-mail</label>
                    <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="nfe@empresa.com.br"/></div>
                  <div className="divider col-2"/>
                  <div className="form-group col-2"><label>Endereço</label>
                    <input value={form.endereco} onChange={e=>setForm(p=>({...p,endereco:e.target.value}))} placeholder="Rua, Avenida, Rodovia..."/></div>
                  <div className="form-group"><label>Número</label>
                    <input value={form.numero} onChange={e=>setForm(p=>({...p,numero:e.target.value}))} placeholder="Nº ou S/N"/></div>
                  <div className="form-group"><label>Bairro</label>
                    <input value={form.bairro} onChange={e=>setForm(p=>({...p,bairro:e.target.value}))} placeholder="Bairro"/></div>
                  <div className="form-group"><label>Município</label>
                    <input value={form.municipio} onChange={e=>setForm(p=>({...p,municipio:e.target.value}))} placeholder="Cidade"/></div>
                  <div className="form-group"><label>UF</label>
                    <select value={form.uf} onChange={e=>setForm(p=>({...p,uf:e.target.value}))}>{UFs.map(u=><option key={u}>{u}</option>)}</select></div>
                  <div className="form-group"><label>CEP</label>
                    <input value={form.cep} onChange={e=>setForm(p=>({...p,cep:maskCEP(e.target.value)}))} placeholder="00000-000"/></div>
                </>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" disabled={saving} onClick={salvar}>{saving?<span className="spinner"/>:'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PRODUTOS (CRUD Supabase)
// ============================================================
function Produtos({tenantId,produtos,reload,toast}){
  const [modal,setModal]=useState(false);
  const [editId,setEditId]=useState(null);
  const [saving,setSaving]=useState(false);
  const vazio={codigo:'',descricao:'',ncm:'25161100',cfop_padrao:'6102',unidade:'M3',valor_unitario:'',icms_cst:'00',icms_aliquota:12};
  const [form,setForm]=useState(vazio);

  function novo(){setForm(vazio);setEditId(null);setModal(true);}
  function editar(p){setForm({...p,valor_unitario:String(p.valor_unitario)});setEditId(p.id);setModal(true);}

  async function salvar(){
    if(!form.descricao||!form.ncm){toast('Preencha descrição e NCM','error');return;}
    setSaving(true);
    const payload={tenant_id:tenantId,codigo:form.codigo,descricao:form.descricao,ncm:form.ncm,
      cfop_padrao:form.cfop_padrao,unidade:form.unidade,valor_unitario:parseFloat(form.valor_unitario)||0,
      icms_cst:form.icms_cst,icms_aliquota:parseFloat(form.icms_aliquota)||0};
    let error;
    if(editId){({error}=await supabase.from('produtos').update(payload).eq('id',editId));}
    else{({error}=await supabase.from('produtos').insert(payload));}
    setSaving(false);
    if(error){toast('Erro ao salvar: '+error.message,'error');return;}
    toast(editId?'Produto atualizado':'Produto cadastrado','success');setModal(false);reload();
  }
  async function excluir(id){
    const {error}=await supabase.from('produtos').delete().eq('id',id);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast('Produto removido','info');reload();
  }

  return (
    <div className="page">
      <PageHeader titulo="Produtos" sub="Catálogo de itens · pré-configurado para granito"
        acao={<button className="btn btn-primary" onClick={novo}>+ Novo Produto</button>}/>
      <div className="alert alert-info" style={{marginBottom:20}}>
        ℹ NCM <strong>2516.11.00</strong> (granito bruto) e CFOP <strong>6102</strong> vêm pré-preenchidos. Ajuste conforme a operação.
      </div>
      <div className="card card-pad">
        {produtos.length===0? <div className="empty-state"><div className="empty-icon">◧</div><div className="empty-title">Nenhum produto</div><div>Cadastre os tipos de bloco que você vende</div></div> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Código</th><th>Descrição</th><th>NCM</th><th>CFOP</th><th>UN</th><th>Valor Unit.</th><th>CST</th><th>ICMS</th><th></th></tr></thead>
          <tbody>{produtos.map(p=>(
            <tr key={p.id}>
              <td className="mono">{p.codigo}</td>
              <td className="cell-strong" style={{maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.descricao}</td>
              <td className="mono">{p.ncm}</td><td className="mono">{p.cfop_padrao}</td><td className="mono">{p.unidade}</td>
              <td className="cell-money">{fmt.moeda(p.valor_unitario)}</td><td className="mono">{p.icms_cst}</td><td className="mono">{p.icms_aliquota}%</td>
              <td><button className="btn btn-ghost btn-sm" onClick={()=>editar(p)}>✎</button></td>
            </tr>))}</tbody>
        </table></div>)}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div><div className="modal-title">{editId?'Editar':'Novo'} Produto</div><div className="modal-sub">Item do catálogo para NF-e</div></div>
              <button className="modal-close" onClick={()=>setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid form-grid-3" style={{gap:14}}>
                <div className="form-group"><label>Código</label><input value={form.codigo} onChange={e=>setForm(p=>({...p,codigo:e.target.value}))} placeholder="GR-001"/></div>
                <div className="form-group col-2"><label>Descrição</label><input value={form.descricao} onChange={e=>setForm(p=>({...p,descricao:e.target.value}))} placeholder="Bloco de Granito Amarelo Real - Tipo A"/></div>
                <div className="form-group"><label>NCM</label><input value={form.ncm} onChange={e=>setForm(p=>({...p,ncm:e.target.value}))}/></div>
                <div className="form-group"><label>CFOP Padrão</label><select value={form.cfop_padrao} onChange={e=>setForm(p=>({...p,cfop_padrao:e.target.value}))}>{CFOP_OPCOES.map(c=><option key={c.value} value={c.value}>{c.value}</option>)}</select></div>
                <div className="form-group"><label>Unidade</label><select value={form.unidade} onChange={e=>setForm(p=>({...p,unidade:e.target.value}))}><option>M3</option><option>TON</option><option>KG</option><option>UN</option><option>PC</option></select></div>
                <div className="form-group"><label>Valor Unitário (R$)</label><input type="number" step="0.01" value={form.valor_unitario} onChange={e=>setForm(p=>({...p,valor_unitario:e.target.value}))} placeholder="0,00"/></div>
                <div className="form-group"><label>CST ICMS</label><input value={form.icms_cst} onChange={e=>setForm(p=>({...p,icms_cst:e.target.value}))} placeholder="00"/></div>
                <div className="form-group"><label>Alíquota ICMS (%)</label><input type="number" step="0.01" value={form.icms_aliquota} onChange={e=>setForm(p=>({...p,icms_aliquota:e.target.value}))} placeholder="12"/></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" disabled={saving} onClick={salvar}>{saving?<span className="spinner"/>:'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// EMISSÃO DE NF-e (grava no Supabase; emissão Focus = fase 2)
// ============================================================
const itemVazio=()=>({uid:Date.now()+Math.random(),bloco_id:'',produto_id:'',descricao:'',ncm:'25161100',cfop:'6102',unidade:'M3',quantidade:'',valor_unitario:'',cst:'00',icms_aliquota:12});

function EmissaoNFe({tenantId,emitente,destinatarios,produtos,blocos,cfops=[],naturezas=[],transportadores=[],observacoes=[],reload,toast,goTo,rascunhoVenda,limparRascunho}){
  const [step,setStep]=useState(1);
  const [salvando,setSalvando]=useState(false);
  const [bloqueios,setBloqueios]=useState([]);
  const [form,setForm]=useState({
    natureza:'Venda de Producao do Estabelecimento',
    data_emissao:new Date().toISOString().slice(0,10),
    cfop:'6102',destinatario_id:'',itens:[itemVazio()],
    pis_cofins_cst:'01', pis_aliquota:'0.65', cofins_aliquota:'3',
    ibscbs_cst:'000', ibscbs_classtrib:'000001', ibs_aliquota:'0.10', cbs_aliquota:'0.90',
    tipo_emissao:'1', finalidade:'1', tipo_documento:'1', chave_referenciada:'',
    forma_pagamento:'0', meio_pagamento:'15', valor_pagamento:'',
    tem_importacao:false,
    di:{numero:'',data_registro:'',local_desembaraco:'',uf_desembaraco:'ES',data_desembaraco:'',
        tipo_intermedio:'1',cnpj_adquirente:'',uf_terceiro:'',
        adicoes:[{numero:'',sequencial:'1',codigo_fabricante:'',valor_desconto:''}]},
    frete_modalidade:'9',transportador_id:'',motorista:'',placa_cavalo:'',placa_carreta1:'',placa_carreta2:'',peso_bruto:'',peso_liquido:'',volumes:'',info_adicionais:'',
  });
  const dest=destinatarios.find(d=>d.id===form.destinatario_id);
  const setF=(k,v)=>setForm(p=>({...p,[k]:v}));
  const setDI=(k,v)=>setForm(p=>({...p,di:{...p.di,[k]:v}}));
  const setAdicao=(idx,k,v)=>setForm(p=>({...p,di:{...p.di,adicoes:p.di.adicoes.map((a,i)=>i===idx?{...a,[k]:v}:a)}}));
  const addAdicao=()=>setForm(p=>({...p,di:{...p.di,adicoes:[...p.di.adicoes,{numero:'',sequencial:String(p.di.adicoes.length+1),codigo_fabricante:'',valor_desconto:''}]}}));
  const rmAdicao=(idx)=>setForm(p=>({...p,di:{...p.di,adicoes:p.di.adicoes.filter((_,i)=>i!==idx)}}));
  const addItem=()=>setForm(p=>({...p,itens:[...p.itens,itemVazio()]}));
  const rmItem=(uid)=>setForm(p=>({...p,itens:p.itens.filter(i=>i.uid!==uid)}));

  // Pré-preenche o formulário a partir de uma venda do Stone Block (rascunho)
  useEffect(()=>{
    if(!rascunhoVenda) return;
    const v=rascunhoVenda;
    // tenta casar o cliente pelo CNPJ/CPF
    const docVenda=(v.cliente_cnpj_cpf||'').replace(/\D/g,'');
    const cliente=destinatarios.find(d=>(d.cnpj_cpf||'').replace(/\D/g,'')===docVenda);
    // monta os itens a partir da venda, casando produto pelo NCM+descrição quando possível
    const itensVenda=(v.itens||[]).map(it=>{
      const prod=produtos.find(p=>(p.descricao||'').toUpperCase()===(it.descricao||'').toUpperCase())
        || produtos.find(p=>(p.ncm||'')===(it.ncm||'') && it.ncm);
      const base=itemVazio();
      return {...base,
        produto_id:prod?prod.id:'',
        descricao:it.descricao||'',
        ncm:(it.ncm||base.ncm),
        cfop:it.cfop||base.cfop,
        unidade:(it.unidade||base.unidade),
        quantidade:String(it.quantidade||''),
        valor_unitario:String(it.valor_unitario||''),
      };
    });
    setForm(p=>({...p,
      destinatario_id:cliente?cliente.id:'',
      itens:itensVenda.length?itensVenda:p.itens,
      info_adicionais:(v.observacoes||'')+(v.sb_pedido_numero?` | Pedido Stone Block: ${v.sb_pedido_numero}`:''),
      _venda_sb_id:v.id, // guarda o vínculo para marcar como emitida depois
    }));
    if(!cliente){
      toast('Venda importada. O cliente não está cadastrado — selecione ou cadastre antes de emitir.','info');
    } else {
      toast('Venda do Stone Block carregada no rascunho. Revise e emita.','success');
    }
  },[rascunhoVenda]);
  function setItem(uid,k,v){
    setForm(p=>({...p,itens:p.itens.map(i=>{
      if(i.uid!==uid)return i;
      let u={...i,[k]:v};
      if(k==='produto_id'){const pr=produtos.find(x=>x.id===v);
        if(pr)u={...u,descricao:pr.descricao,ncm:pr.ncm,cfop:pr.cfop_padrao,unidade:pr.unidade,valor_unitario:String(pr.valor_unitario),cst:pr.icms_cst,icms_aliquota:pr.icms_aliquota};}
      if(k==='bloco_id'){const b=blocos.find(x=>x.id===v);
        if(b){
          const pr=produtos.find(x=>x.id===b.produto_id);
          u={...u,bloco_id:v,
            descricao:`Bloco ${b.numero_bloco} - ${b.produto_nome||pr?.descricao||'Granito'}`,
            ncm:pr?.ncm||'25161100', cfop:pr?.cfop_padrao||'6102', unidade:'M3',
            quantidade:String(b.m3_liquido||0), valor_unitario:String(b.preco_m3||0),
            cst:pr?.icms_cst||'00', icms_aliquota:pr?.icms_aliquota||12,
            produto_id:b.produto_id||''};
        } else { u={...u,bloco_id:''}; }
      }
      return u;
    })}));
  }
  const totais=form.itens.reduce((a,i)=>{const s=(parseFloat(i.quantidade)||0)*(parseFloat(i.valor_unitario)||0);return{sub:a.sub+s,icms:a.icms+s*((parseFloat(i.icms_aliquota)||0)/100)};},{sub:0,icms:0});
  const totalNota=totais.sub+(parseFloat(form.frete_valor)||0);

  function valida(s){
    if(s===1&&!form.destinatario_id){toast('Selecione o cliente','error');return false;}
    if(s===2){for(const it of form.itens)if(!it.descricao||!it.quantidade||!it.valor_unitario){toast('Preencha todos os itens','error');return false;}}
    return true;
  }
  const proximo=()=>{if(valida(step))setStep(s=>Math.min(s+1,4));};

  async function emitir(){
    // ===== Validação pré-emissão: bloqueia e mostra TUDO que falta =====
    const faltas=[];
    // Emitente
    if(!emitente){toast('Cadastre os dados da empresa em Configurações primeiro','error');return;}
    if(!emitente.razao_social) faltas.push('Razão social da empresa (Configurações)');
    if(!validaCNPJ(emitente.cnpj)) faltas.push('CNPJ da empresa inválido (Configurações)');
    if(!emitente.ie) faltas.push('Inscrição Estadual da SUA empresa — preencha em Configurações → Dados Fiscais');
    if(!emitente.endereco) faltas.push('Endereço da empresa (Configurações)');
    if(!emitente.bairro) faltas.push('Bairro da empresa (Configurações)');
    if(!emitente.municipio) faltas.push('Município da empresa (Configurações)');
    if(!emitente.uf) faltas.push('UF da empresa (Configurações)');
    if(!validaCEP(emitente.cep)) faltas.push('CEP da empresa inválido (Configurações)');
    // Cliente
    if(!dest){faltas.push('Selecionar o cliente');}
    else if(dest.estrangeiro){
      if(!dest.razao_social) faltas.push('Razão social do cliente');
      if(!dest.endereco) faltas.push('Endereço do cliente estrangeiro');
      if(!dest.pais_codigo) faltas.push('País do cliente estrangeiro');
    }
    else{
      if(!validaDoc(dest.cnpj_cpf)) faltas.push('CNPJ/CPF do cliente inválido');
      if(!dest.endereco) faltas.push('Endereço do cliente');
      if(!dest.bairro) faltas.push('Bairro do cliente');
      if(!dest.municipio) faltas.push('Município do cliente');
      if(!dest.uf) faltas.push('UF do cliente');
      if(!validaCEP(dest.cep)) faltas.push('CEP do cliente inválido');
    }
    // Itens
    if(!form.itens?.length || !form.itens.some(it=>it.descricao)){
      faltas.push('Pelo menos um item na nota');
    } else {
      form.itens.forEach((it,i)=>{
        if(!it.descricao) faltas.push(`Item ${i+1}: descrição`);
        if(!soDigitos(it.ncm)||soDigitos(it.ncm).length!==8) faltas.push(`Item ${i+1}: NCM (8 dígitos)`);
        if(!it.cfop) faltas.push(`Item ${i+1}: CFOP`);
        if(!(parseFloat(it.quantidade)>0)) faltas.push(`Item ${i+1}: quantidade`);
        if(!(parseFloat(it.valor_unitario)>0)) faltas.push(`Item ${i+1}: valor unitário`);
      });
    }
    // Pagamento (valor obrigatório e deve bater com o total)
    if(!(parseFloat(form.valor_pagamento)>0)){
      faltas.push('Valor do pagamento (aba Pagamento)');
    } else if(Math.abs(parseFloat(form.valor_pagamento)-totalNota)>0.01){
      faltas.push(`Valor do pagamento (${fmt.moeda(parseFloat(form.valor_pagamento))}) deve ser igual ao total da NF-e (${fmt.moeda(totalNota)})`);
    }
    // Chave referenciada (obrigatória p/ complementar, ajuste e devolução)
    if(['2','3','4'].includes(form.finalidade) && form.chave_referenciada.length!==44){
      faltas.push('Chave de acesso da NF-e referenciada (44 dígitos)');
    }

    if(faltas.length){
      setBloqueios(faltas);
      toast(`Não é possível emitir: ${faltas.length} pendência(s). Veja a lista.`,'error');
      return;
    }
    setBloqueios([]);

    setSalvando(true);

    const numero=(emitente.proximo_numero||1);
    // "ref" é o identificador único da nota na Focus NFe. Usamos algo
    // rastreável: cnpj + numero + timestamp curto.
    const ref = `${soDigitos(emitente.cnpj)}-${numero}-${Date.now().toString().slice(-6)}`;

    // 1. cria a nota no banco como "processando"
    const {data:nota,error}=await supabase.from('notas_fiscais').insert({
      tenant_id:tenantId,emitente_id:emitente.id,destinatario_id:form.destinatario_id,
      destinatario_nome:dest?.razao_social||'',numero,serie:String(emitente.serie_nfe||1),
      natureza:form.natureza,cfop:form.cfop,data_emissao:form.data_emissao,
      valor_produtos:totais.sub,valor_total:totalNota,
      frete_modalidade:form.frete_modalidade,peso_bruto:parseFloat(form.peso_bruto)||null,
      peso_liquido:parseFloat(form.peso_liquido)||null,volumes:parseInt(form.volumes)||null,
      transportador_id:form.transportador_id||null,motorista:form.motorista||null,
      placa_cavalo:form.placa_cavalo||null,placa_carreta1:form.placa_carreta1||null,placa_carreta2:form.placa_carreta2||null,
      info_adicionais:form.info_adicionais,status:'processando',focus_ref:ref,
    }).select().single();
    if(error){setSalvando(false);toast('Erro ao salvar nota: '+error.message,'error');return;}

    // 2. grava os itens
    const itensPayload=form.itens.map((it,idx)=>({
      tenant_id:tenantId,nota_id:nota.id,produto_id:it.produto_id||null,descricao:it.descricao,
      ncm:it.ncm,cfop:it.cfop,unidade:it.unidade,quantidade:parseFloat(it.quantidade)||0,
      valor_unitario:parseFloat(it.valor_unitario)||0,valor_total:(parseFloat(it.quantidade)||0)*(parseFloat(it.valor_unitario)||0),
      icms_cst:it.cst,icms_aliquota:parseFloat(it.icms_aliquota)||0,ordem:idx+1,
    }));
    await supabase.from('itens_nfe').insert(itensPayload);

    // 2b. marca os blocos vendidos como "vendido"
    const blocosVendidos=form.itens.filter(it=>it.bloco_id).map(it=>it.bloco_id);
    if(blocosVendidos.length){
      await supabase.from('blocos').update({status:'vendido'}).in('id',blocosVendidos);
    }

    // 3. avança a numeração
    await supabase.from('emitentes').update({proximo_numero:numero+1}).eq('id',emitente.id);

    // 4. transmite para a Focus NFe via função serverless (token protegido no servidor)
    try{
      const resp = await fetch('/api/emitir',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          ref,
          emitente,
          destinatario: dest,
          itens: form.itens.map(it=>({
            codigo: it.codigo, descricao: it.descricao, ncm: it.ncm, cfop: it.cfop,
            unidade: it.unidade, quantidade: it.quantidade, valor_unitario: it.valor_unitario,
            icms_cst: it.cst, icms_aliquota: it.icms_aliquota, origem: it.origem ?? '0',
            pis_cofins_cst: form.pis_cofins_cst,
            pis_aliquota: form.pis_aliquota, cofins_aliquota: form.cofins_aliquota,
            ibscbs_cst: form.ibscbs_cst, ibscbs_classtrib: form.ibscbs_classtrib,
            ibs_aliquota: form.ibs_aliquota, cbs_aliquota: form.cbs_aliquota,
          })),
          transporte:(()=>{ const t=transportadores.find(x=>x.id===form.transportador_id);
            return { frete_modalidade: form.frete_modalidade,
              transp_nome: t?.nome||'', transp_cnpj_cpf: t?.cnpj_cpf||'',
              motorista: form.motorista,
              placa_cavalo: form.placa_cavalo, placa_carreta1: form.placa_carreta1, placa_carreta2: form.placa_carreta2,
              peso_bruto: form.peso_bruto, peso_liquido: form.peso_liquido, volumes: form.volumes }; })(),
          info:{ natureza: form.natureza, data_emissao: form.data_emissao, info_adicionais: form.info_adicionais, tipo_emissao: form.tipo_emissao,
            finalidade: form.finalidade, tipo_documento: form.tipo_documento, chave_referenciada: form.chave_referenciada },
          pagamento:{ forma: form.forma_pagamento, meio: form.meio_pagamento, valor: form.valor_pagamento },
          importacao: form.tem_importacao ? form.di : null,
        }),
      });
      const out = await resp.json();
      if(!resp.ok || out.erro){
        await supabase.from('notas_fiscais').update({status:'rejeitada',mensagem_sefaz:out.erro||'Erro na transmissão'}).eq('id',nota.id);
        toast('Falha na transmissão: '+(out.erro||'erro desconhecido'),'error');
      } else {
        toast('NF-e enviada à SEFAZ. Consultando autorização...','info');
        // 5. consulta o status após alguns segundos (SEFAZ é assíncrona)
        setTimeout(()=>consultarStatus(nota.id, ref), 4000);
      }
    }catch(e){
      await supabase.from('notas_fiscais').update({status:'rejeitada',mensagem_sefaz:e.message}).eq('id',nota.id);
      toast('Erro de rede ao transmitir: '+e.message,'error');
    }

    setSalvando(false);
    reload();goTo('notas');
  }

  async function consultarStatus(notaId, ref){
    try{
      const r = await fetch('/api/consultar?ref='+encodeURIComponent(ref));
      const d = await r.json();
      const upd = { status: d.status_app, mensagem_sefaz: d.mensagem_sefaz||null };
      if(d.chave) upd.chave = d.chave;
      if(d.protocolo) upd.protocolo = d.protocolo;
      if(d.caminho_xml) upd.xml_url = d.base_url + d.caminho_xml;
      if(d.caminho_danfe) upd.danfe_url = d.base_url + d.caminho_danfe;
      await supabase.from('notas_fiscais').update(upd).eq('id',notaId);
      if(d.status_app==='autorizada') toast('NF-e autorizada pela SEFAZ! ✓','success');
      else if(d.status_app==='rejeitada') toast('NF-e rejeitada: '+(d.mensagem_sefaz||'ver detalhes'),'error');
      else { toast('Ainda processando. Consulte novamente em instantes.','info');
             setTimeout(()=>consultarStatus(notaId, ref), 6000); }
      reload();
    }catch(e){ /* silencioso: o usuário pode reconsultar pela lista */ }
  }

  const steps=[{n:1,l:'Cliente'},{n:2,l:'Itens'},{n:3,l:'Transporte'},{n:4,l:'Revisão'}];

  return (
    <div className="page">
      <PageHeader titulo="Emitir NF-e" sub="Nota Fiscal Eletrônica · Modelo 55"/>

      <div className="steps">{steps.map((s,i)=>(
        <div key={s.n} style={{display:'flex',alignItems:'center',flex:i<steps.length-1?1:'none'}}>
          <div className={`step ${step===s.n?'active':step>s.n?'done':''}`}><div className="step-num">{step>s.n?'✓':s.n}</div>{s.l}</div>
          {i<steps.length-1&&<div className="step-line"/>}
        </div>))}</div>

      <div className="card card-pad">
        {step===1 && (
          <div className="form-grid form-grid-2" style={{gap:14}}>
            <div className="form-group col-2"><label>Natureza da Operação</label>
              <input list="lista-naturezas" value={form.natureza} onChange={e=>{
                const v=e.target.value; const nat=naturezas.find(n=>n.descricao===v);
                if(nat&&nat.cfop_padrao){setForm(p=>({...p,natureza:v,cfop:nat.cfop_padrao}));}
                else setF('natureza',v);
              }}/>
              <datalist id="lista-naturezas">{naturezas.map(n=><option key={n.id} value={n.descricao}/>)}</datalist>
            </div>
            <div className="form-group col-2"><label>Tipo de Emissão</label>
              <select value={form.tipo_emissao} onChange={e=>setF('tipo_emissao',e.target.value)}>
                <option value="1">1 - Emissão Normal</option>
                <option value="6">6 - Contingência SVC-AN (SEFAZ Virtual Nacional)</option>
                <option value="2">2 - Contingência FS-IA (formulário de segurança)</option>
                <option value="4">4 - Contingência DPEC</option>
                <option value="5">5 - Contingência FS-DA</option>
              </select>
              <span className="form-hint">Use SVC-AN quando a SEFAZ do seu estado estiver fora do ar.</span>
            </div>
            <div className="form-group"><label>Tipo de Documento</label>
              <select value={form.tipo_documento} onChange={e=>setF('tipo_documento',e.target.value)}>
                <option value="1">1 - Saída</option>
                <option value="0">0 - Entrada</option>
              </select></div>
            <div className="form-group col-2"><label>Finalidade da NF-e</label>
              <select value={form.finalidade} onChange={e=>setF('finalidade',e.target.value)}>
                <option value="1">1 - NF-e Normal</option>
                <option value="2">2 - NF-e Complementar</option>
                <option value="3">3 - NF-e de Ajuste</option>
                <option value="4">4 - Devolução de Mercadoria</option>
                <option value="5">5 - Nota de Crédito</option>
                <option value="6">6 - Nota de Débito</option>
              </select></div>
            {['2','3','4'].includes(form.finalidade) && (
              <div className="form-group col-3"><label>Chave de Acesso da NF-e Referenciada (44 dígitos)</label>
                <input value={form.chave_referenciada} onChange={e=>setF('chave_referenciada',e.target.value.replace(/\D/g,'').slice(0,44))} placeholder="Chave da nota original"/>
                <span className="form-hint">Obrigatória para NF-e complementar, de ajuste ou devolução. {form.chave_referenciada.length}/44 dígitos.</span>
              </div>
            )}
            <div className="form-group"><label>Data de Emissão</label><input type="date" value={form.data_emissao} onChange={e=>setF('data_emissao',e.target.value)}/></div>
            <div className="form-group"><label>CFOP Principal</label>
              <input list="lista-cfops" value={form.cfop} onChange={e=>setF('cfop',e.target.value)} placeholder="6102"/>
              <datalist id="lista-cfops">{cfops.map(c=><option key={c.id} value={c.codigo}>{c.codigo} - {c.descricao}</option>)}</datalist>
            </div>
            <div className="form-group col-2"><label>Cliente</label>
              <select value={form.destinatario_id} onChange={e=>setF('destinatario_id',e.target.value)}>
                <option value="">— Selecione —</option>{destinatarios.map(d=><option key={d.id} value={d.id}>{d.razao_social} | {d.cnpj_cpf}</option>)}
              </select>
              {destinatarios.length===0 && <span className="form-hint">Nenhum cliente. Cadastre um na aba Clientes.</span>}
            </div>
            {dest && <div className="col-2" style={{background:'var(--blue-50)',border:'1px solid #bfdbfe',borderRadius:'var(--radius)',padding:'12px 14px'}}>
              <div className="cell-strong">{dest.razao_social}</div>
              <div className="mono" style={{color:'var(--text-3)',marginTop:2}}>{dest.cnpj_cpf} · IE {dest.ie||'ISENTO'} · {dest.municipio}/{dest.uf}</div>
            </div>}
          </div>
        )}

        {step===2 && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div style={{fontFamily:'var(--font-display)',fontWeight:700}}>Itens da Nota</div>
              <button className="btn btn-ghost btn-sm" onClick={addItem}>+ Adicionar Item</button>
            </div>
            {form.itens.map(it=>(
              <div key={it.uid} className="item-row">
                <div className="form-group"><label>Produto / Descrição</label>
                  <select value={it.bloco_id} onChange={e=>setItem(it.uid,'bloco_id',e.target.value)} style={{marginBottom:6,borderColor:it.bloco_id?'var(--blue-500)':undefined}}>
                    <option value="">— Selecionar bloco disponível —</option>
                    {blocos.filter(b=>b.status==='disponivel'||b.id===it.bloco_id).map(b=>(
                      <option key={b.id} value={b.id}>Bloco {b.numero_bloco} · {b.produto_nome||'Granito'} · {Number(b.m3_liquido).toLocaleString('pt-BR')}m³</option>))}
                  </select>
                  <select value={it.produto_id} onChange={e=>setItem(it.uid,'produto_id',e.target.value)} style={{marginBottom:6}}>
                    <option value="">— ou produto manual —</option>{produtos.map(p=><option key={p.id} value={p.id}>{p.codigo} {p.descricao}</option>)}
                  </select>
                  <input value={it.descricao} onChange={e=>setItem(it.uid,'descricao',e.target.value)} placeholder="Descrição"/>
                </div>
                <div className="form-group"><label>NCM</label><input value={it.ncm} onChange={e=>setItem(it.uid,'ncm',e.target.value)}/></div>
                <div className="form-group"><label>Qtd</label><input type="number" step="0.001" value={it.quantidade} onChange={e=>setItem(it.uid,'quantidade',e.target.value)}/></div>
                <div className="form-group"><label>Unid</label><select value={it.unidade} onChange={e=>setItem(it.uid,'unidade',e.target.value)}>{['M3','TON','KG','UN','PC'].map(u=><option key={u}>{u}</option>)}</select></div>
                <div className="form-group"><label>Vlr Unit</label><input type="number" step="0.01" value={it.valor_unitario} onChange={e=>setItem(it.uid,'valor_unitario',e.target.value)}/></div>
                <div className="form-group"><label>Subtotal</label>
                  <div style={{padding:'10px 12px',background:'#fff',border:'1px solid var(--border)',borderRadius:'var(--radius)'}} className="cell-money">{fmt.moeda((parseFloat(it.quantidade)||0)*(parseFloat(it.valor_unitario)||0))}</div></div>
                {form.itens.length>1 && <button className="btn btn-danger btn-sm" style={{marginBottom:1}} onClick={()=>rmItem(it.uid)}>✕</button>}
              </div>
            ))}
            <div style={{marginTop:14,padding:'14px 18px',background:'var(--blue-50)',borderRadius:'var(--radius)',display:'flex',gap:28,justifyContent:'flex-end'}}>
              <div style={{textAlign:'right'}}><div className="stat-label">Produtos</div><div style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:800,color:'var(--blue-700)'}}>{fmt.moeda(totais.sub)}</div></div>
              <div style={{textAlign:'right'}}><div className="stat-label">ICMS aprox.</div><div className="mono" style={{fontSize:16,color:'var(--text-2)'}}>{fmt.moeda(totais.icms)}</div></div>
            </div>
          </div>
        )}

        {step===3 && (
          <div className="form-grid form-grid-3" style={{gap:14}}>
            <div className="form-group col-3" style={{borderBottom:'1px solid var(--border-2)',paddingBottom:6,marginBottom:2}}>
              <span style={{fontFamily:'var(--font-display)',fontWeight:700,color:'var(--blue-700)'}}>Importação</span>
            </div>
            <div className="form-group col-3">
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',margin:0}}>
                <input type="checkbox" checked={!!form.tem_importacao} onChange={e=>setF('tem_importacao',e.target.checked)} style={{width:'auto'}}/>
                Esta nota possui Declaração de Importação (DI)
              </label>
            </div>
            {form.tem_importacao && <>
              <div className="form-group"><label>Nº da DI</label><input value={form.di.numero} onChange={e=>setDI('numero',e.target.value)} placeholder="00/0000000-0"/></div>
              <div className="form-group"><label>Data de Registro</label><input type="date" value={form.di.data_registro} onChange={e=>setDI('data_registro',e.target.value)}/></div>
              <div className="form-group"><label>Data Desembaraço</label><input type="date" value={form.di.data_desembaraco} onChange={e=>setDI('data_desembaraco',e.target.value)}/></div>
              <div className="form-group col-2"><label>Local do Desembaraço</label><input value={form.di.local_desembaraco} onChange={e=>setDI('local_desembaraco',e.target.value)} placeholder="Porto/Aeroporto"/></div>
              <div className="form-group"><label>UF Desembaraço</label><select value={form.di.uf_desembaraco} onChange={e=>setDI('uf_desembaraco',e.target.value)}>{UFs.map(u=><option key={u}>{u}</option>)}</select></div>
              <div className="form-group col-3" style={{marginTop:4}}>
                <label>Adições da DI</label>
                {form.di.adicoes.map((a,i)=>(
                  <div key={i} style={{display:'flex',gap:8,marginBottom:6,alignItems:'center'}}>
                    <input style={{flex:1}} value={a.numero} onChange={e=>setAdicao(i,'numero',e.target.value)} placeholder="Nº adição"/>
                    <input style={{width:90}} value={a.sequencial} onChange={e=>setAdicao(i,'sequencial',e.target.value)} placeholder="Seq."/>
                    <input style={{flex:1}} value={a.codigo_fabricante} onChange={e=>setAdicao(i,'codigo_fabricante',e.target.value)} placeholder="Cód. fabricante"/>
                    {form.di.adicoes.length>1 && <button type="button" className="btn btn-danger btn-sm" onClick={()=>rmAdicao(i)}>✕</button>}
                  </div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" onClick={addAdicao}>+ Adicionar adição</button>
              </div>
            </>}

            <div className="form-group col-3" style={{borderBottom:'1px solid var(--border-2)',paddingBottom:6,margin:'10px 0 2px'}}>
              <span style={{fontFamily:'var(--font-display)',fontWeight:700,color:'var(--blue-700)'}}>Pagamento</span>
            </div>
            <div className="form-group"><label>Forma de Pagamento</label>
              <select value={form.forma_pagamento} onChange={e=>setF('forma_pagamento',e.target.value)}>
                <option value="0">0 - À vista</option>
                <option value="1">1 - A prazo</option>
              </select></div>
            <div className="form-group"><label>Meio de Pagamento</label>
              <select value={form.meio_pagamento} onChange={e=>setF('meio_pagamento',e.target.value)}>
                <option value="01">01 - Dinheiro</option>
                <option value="17">17 - PIX</option>
                <option value="15">15 - Boleto bancário</option>
                <option value="03">03 - Cartão de crédito</option>
                <option value="04">04 - Cartão de débito</option>
                <option value="99">99 - Outros</option>
              </select></div>
            <div className="form-group"><label>Valor do Pagamento *</label>
              <input type="number" step="0.01" value={form.valor_pagamento} onChange={e=>setF('valor_pagamento',e.target.value)} placeholder="0,00"/>
              <span className="form-hint">Total da NF-e: {fmt.moeda(totalNota)}. {Math.abs((parseFloat(form.valor_pagamento)||0)-totalNota)<0.01 ? '✓ confere' : '⚠ deve ser igual ao total'}</span>
            </div>
            <div className="form-group col-3" style={{paddingTop:4}}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={()=>setF('valor_pagamento',totalNota.toFixed(2))}>Preencher com o total da nota</button>
            </div>

            <div className="form-group col-3" style={{borderBottom:'1px solid var(--border-2)',paddingBottom:6,margin:'10px 0 2px'}}>
              <span style={{fontFamily:'var(--font-display)',fontWeight:700,color:'var(--blue-700)'}}>Tributação PIS/COFINS</span>
            </div>
            <div className="form-group col-3"><label>Situação Tributária (CST PIS/COFINS)</label>
              <select value={form.pis_cofins_cst} onChange={e=>setF('pis_cofins_cst',e.target.value)}>
                <option value="01">01 - Tributável com alíquota básica (venda interna no país)</option>
                <option value="04">04 - Monofásica - alíquota zero (revenda)</option>
                <option value="06">06 - Alíquota zero</option>
                <option value="07">07 - Isenta da contribuição</option>
                <option value="08">08 - Sem incidência da contribuição (exportação fim específico)</option>
                <option value="09">09 - Com suspensão da contribuição</option>
                <option value="49">49 - Outras operações de saída</option>
              </select>
              <span className="form-hint">CST 01 para venda interna tributada · CST 08 para exportação.</span>
            </div>
            {form.pis_cofins_cst==='01' && <>
              <div className="form-group"><label>Alíquota PIS (%)</label><input type="number" step="0.01" value={form.pis_aliquota} onChange={e=>setF('pis_aliquota',e.target.value)}/></div>
              <div className="form-group"><label>Alíquota COFINS (%)</label><input type="number" step="0.01" value={form.cofins_aliquota} onChange={e=>setF('cofins_aliquota',e.target.value)}/></div>
              <div className="form-group"><label></label><span className="form-hint" style={{paddingTop:10,display:'block'}}>Lucro Presumido: PIS 0,65% / COFINS 3%</span></div>
            </>}

            <div className="form-group col-3" style={{borderBottom:'1px solid var(--border-2)',paddingBottom:6,margin:'10px 0 2px'}}>
              <span style={{fontFamily:'var(--font-display)',fontWeight:700,color:'var(--blue-700)'}}>IBS / CBS (Reforma Tributária)</span>
            </div>
            <div className="form-group col-3"><div className="alert alert-info" style={{margin:0}}>ℹ Informação obrigatória no XML a partir de 2026. Alíquotas de teste pré-preenchidas. O cClassTrib deve refletir a classificação do produto (consulte seu contador).</div></div>
            <div className="form-group"><label>CST IBS/CBS</label>
              <select value={form.ibscbs_cst} onChange={e=>setF('ibscbs_cst',e.target.value)}>
                <option value="000">000 - Tributação integral</option>
                <option value="010">010 - Alíquota reduzida</option>
                <option value="200">200 - Alíquota zero</option>
                <option value="400">400 - Não tributada</option>
                <option value="555">555 - Suspensão</option>
                <option value="800">800 - Exportação (imunidade)</option>
              </select></div>
            <div className="form-group"><label>cClassTrib</label>
              <input value={form.ibscbs_classtrib} onChange={e=>setF('ibscbs_classtrib',e.target.value)} placeholder="000001"/>
              <span className="form-hint">Código de classificação tributária do item.</span></div>
            <div className="form-group"></div>
            <div className="form-group"><label>Alíquota IBS (%)</label><input type="number" step="0.01" value={form.ibs_aliquota} onChange={e=>setF('ibs_aliquota',e.target.value)}/></div>
            <div className="form-group"><label>Alíquota CBS (%)</label><input type="number" step="0.01" value={form.cbs_aliquota} onChange={e=>setF('cbs_aliquota',e.target.value)}/></div>
            <div className="form-group"><label></label><span className="form-hint" style={{paddingTop:10,display:'block'}}>Teste: IBS 0,10% / CBS 0,90%. Base = valor do item (editável no futuro).</span></div>

            <div className="form-group col-3" style={{borderBottom:'1px solid var(--border-2)',paddingBottom:6,margin:'10px 0 2px'}}>
              <span style={{fontFamily:'var(--font-display)',fontWeight:700,color:'var(--blue-700)'}}>Transporte</span>
            </div>
            <div className="form-group"><label>Modalidade do Frete</label><select value={form.frete_modalidade} onChange={e=>setF('frete_modalidade',e.target.value)}>
              <option value="0">0 - Remetente (CIF)</option>
              <option value="1">1 - Destinatário (FOB)</option>
              <option value="2">2 - Terceiros</option>
              <option value="3">3 - Transporte Próprio (Remetente)</option>
              <option value="4">4 - Transporte Próprio (Destinatário)</option>
              <option value="9">9 - Sem Ocorrência de Transporte</option></select></div>
            <div className="form-group col-2"><label>Transportador</label>
              <select value={form.transportador_id} onChange={e=>setF('transportador_id',e.target.value)}>
                <option value="">— Selecione (opcional) —</option>
                {transportadores.map(t=><option key={t.id} value={t.id}>{t.nome}{t.cnpj_cpf?` — ${t.cnpj_cpf}`:''}</option>)}
              </select>
              <span className="form-hint">Cadastre transportadores em Cadastros · Transportadores.</span></div>
            <div className="form-group"><label>Motorista</label><input value={form.motorista} onChange={e=>setF('motorista',e.target.value)} placeholder="Nome do motorista"/></div>
            <div className="form-group"><label>Placa Cavalo</label><input value={form.placa_cavalo} onChange={e=>setF('placa_cavalo',e.target.value.toUpperCase())} placeholder="ABC1D23"/></div>
            <div className="form-group"><label>Placa Carreta 01</label><input value={form.placa_carreta1} onChange={e=>setF('placa_carreta1',e.target.value.toUpperCase())} placeholder="ABC1D23"/></div>
            <div className="form-group"><label>Placa Carreta 02</label><input value={form.placa_carreta2} onChange={e=>setF('placa_carreta2',e.target.value.toUpperCase())} placeholder="ABC1D23"/></div>
            <div className="form-group"><label>Volumes</label><input type="number" value={form.volumes} onChange={e=>setF('volumes',e.target.value)} placeholder="1"/></div>
            <div className="form-group"><label>Peso Bruto (kg)</label><input type="number" step="0.001" value={form.peso_bruto} onChange={e=>setF('peso_bruto',e.target.value)}/></div>
            <div className="form-group"><label>Peso Líquido (kg)</label><input type="number" step="0.001" value={form.peso_liquido} onChange={e=>setF('peso_liquido',e.target.value)}/></div>

            {observacoes.length>0 && <div className="form-group col-3"><label>Observações padrão (clique para adicionar)</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {observacoes.map(o=>(
                  <button key={o.id} type="button" className="btn btn-ghost btn-sm" title={o.texto}
                    onClick={()=>setF('info_adicionais', form.info_adicionais ? form.info_adicionais+' '+o.texto : o.texto)}>
                    + {o.titulo}
                  </button>))}
              </div></div>}
            <div className="form-group col-3"><label>Informações Adicionais</label><textarea value={form.info_adicionais} onChange={e=>setF('info_adicionais',e.target.value)} placeholder="Referência de pedido, observações..."/></div>
          </div>
        )}

        {step===4 && (
          <div>
            <div className="form-grid form-grid-2" style={{gap:16,marginBottom:18}}>
              <div style={{background:'var(--bg)',borderRadius:'var(--radius)',padding:16}}>
                <div className="stat-label">Emitente</div>
                <div className="cell-strong" style={{marginTop:4}}>{emitente?.razao_social||'— configure em Configurações —'}</div>
                <div className="mono" style={{color:'var(--text-3)',marginTop:2}}>{emitente?.cnpj} {emitente?.ie?'· IE '+emitente.ie:''}</div>
              </div>
              <div style={{background:'var(--bg)',borderRadius:'var(--radius)',padding:16}}>
                <div className="stat-label">Cliente</div>
                <div className="cell-strong" style={{marginTop:4}}>{dest?.razao_social}</div>
                <div className="mono" style={{color:'var(--text-3)',marginTop:2}}>{dest?.cnpj_cpf} · {dest?.municipio}/{dest?.uf}</div>
              </div>
            </div>
            <div className="stat-label" style={{marginBottom:10}}>Itens ({form.itens.length})</div>
            {form.itens.map((it,i)=>(
              <div key={it.uid} style={{display:'flex',justifyContent:'space-between',padding:'9px 14px',background:'var(--bg)',borderRadius:'var(--radius)',marginBottom:6}}>
                <div><span className="mono" style={{color:'var(--text-3)',marginRight:8}}>{i+1}.</span><span className="cell-strong">{it.descricao}</span>
                  <span className="mono" style={{color:'var(--text-3)',marginLeft:10}}>NCM {it.ncm} · CFOP {it.cfop}</span></div>
                <div className="cell-money">{it.quantidade} {it.unidade} × {fmt.moeda(parseFloat(it.valor_unitario))} = {fmt.moeda((parseFloat(it.quantidade)||0)*(parseFloat(it.valor_unitario)||0))}</div>
              </div>))}
            <div style={{background:'var(--blue-50)',borderRadius:'var(--radius)',padding:'14px 20px',display:'flex',justifyContent:'flex-end',gap:32,marginTop:8}}>
              <div style={{textAlign:'right'}}><div className="stat-label">Produtos</div><div className="mono">{fmt.moeda(totais.sub)}</div></div>
              {parseFloat(form.frete_valor)>0 && <div style={{textAlign:'right'}}><div className="stat-label">Frete</div><div className="mono">{fmt.moeda(parseFloat(form.frete_valor))}</div></div>}
              <div style={{textAlign:'right',borderLeft:'1px solid var(--border-2)',paddingLeft:32}}><div className="stat-label">Total NF-e</div><div style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:800,color:'var(--blue-700)'}}>{fmt.moeda(totalNota)}</div></div>
            </div>
            <div className="alert alert-info" style={{marginTop:16}}>
              ℹ Ao emitir, a nota é transmitida à SEFAZ via Focus NFe{emitente?.certificado_status==='enviado'?'.':' (requer certificado A1 cadastrado em Configurações).'} Em ambiente de <strong>{emitente?.focus_ambiente==='producao'?'produção':'homologação'}</strong>.
            </div>
          </div>
        )}

        {bloqueios.length>0 && (
          <div className="alert" style={{marginTop:20,background:'var(--red-50)',border:'1px solid #fecaca',color:'var(--red-600)',display:'block'}}>
            <div style={{fontWeight:700,marginBottom:8}}>⚠ Corrija antes de emitir ({bloqueios.length}):</div>
            <ul style={{margin:0,paddingLeft:20,lineHeight:1.7}}>
              {bloqueios.map((b,i)=><li key={i}>{b}</li>)}
            </ul>
          </div>
        )}

        <div style={{display:'flex',justifyContent:'space-between',marginTop:24,paddingTop:20,borderTop:'1px solid var(--border)'}}>
          <button className="btn btn-ghost" onClick={()=>setStep(s=>Math.max(s-1,1))} disabled={step===1}>← Voltar</button>
          {step<4? <button className="btn btn-primary" onClick={proximo}>Continuar →</button>
            : <button className="btn btn-emit btn-lg" disabled={salvando} onClick={emitir}>{salvando?<span className="spinner"/>:'⚡ Salvar / Emitir NF-e'}</button>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LISTA DE NOTAS
// ============================================================
// ============================================================
// DOCUMENTOS FISCAIS — portal do contador
// Lista notas por período, com download de XML/DANFE e lote.
// ============================================================
function DocumentosFiscais({notas,emitente,toast}){
  const agora=new Date();
  const [ano,setAno]=useState(agora.getFullYear());
  const [mes,setMes]=useState(agora.getMonth()+1); // 1-12; 0 = personalizado
  const [ini,setIni]=useState('');
  const [fim,setFim]=useState('');
  const [baixandoLote,setBaixandoLote]=useState(false);

  const MESES=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const anos=[];for(let a=agora.getFullYear();a>=agora.getFullYear()-4;a--)anos.push(a);

  // calcula o período conforme o modo (mês ou personalizado)
  function periodo(){
    if(mes===0){ // personalizado
      return {de:ini||'1900-01-01', ate:fim||'2999-12-31'};
    }
    const ultimoDia=new Date(ano,mes,0).getDate();
    const mm=String(mes).padStart(2,'0');
    return {de:`${ano}-${mm}-01`, ate:`${ano}-${mm}-${String(ultimoDia).padStart(2,'0')}`};
  }
  const {de,ate}=periodo();
  const lista=notas.filter(n=>{const d=(n.data_emissao||'').slice(0,10);return d>=de&&d<=ate;})
    .sort((a,b)=>(b.data_emissao||'').localeCompare(a.data_emissao||''));

  // totais
  const totalValor=lista.reduce((s,n)=>s+(parseFloat(n.valor_total)||0),0);
  const autorizadas=lista.filter(n=>n.status==='autorizada').length;
  const comXml=lista.filter(n=>n.xml_url);

  const badge=(s)=>{
    const m={autorizada:{c:'badge-autorizada',l:'Autorizada'},processando:{c:'badge-processando',l:'Processando'},
      rejeitada:{c:'badge-cancelada',l:'Rejeitada'},cancelada:{c:'badge-cancelada',l:'Cancelada'}};
    const x=m[s]||{c:'badge-info',l:s||'—'};return <span className={`badge ${x.c}`}>{x.l}</span>;
  };

  // download em lote: chama a serverless que monta o zip dos XMLs
  async function baixarLoteXML(){
    const refs=comXml.map(n=>n.focus_ref).filter(Boolean);
    if(refs.length===0){toast('Nenhuma nota com XML no período','error');return;}
    setBaixandoLote(true);
    try{
      const r=await fetch('/api/contador-zip',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({refs, periodo:`${de}_a_${ate}`})});
      if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.erro||'Falha ao gerar o lote');}
      const blob=await r.blob();
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');a.href=url;a.download=`XMLs_${de}_a_${ate}.zip`;a.click();
      URL.revokeObjectURL(url);
      toast('Lote de XMLs baixado','success');
    }catch(e){toast('Erro: '+e.message,'error');}
    setBaixandoLote(false);
  }

  return (
    <div className="page">
      <PageHeader titulo="Documentos Fiscais" sub="Notas fiscais para a contabilidade · download de XML e DANFE"/>

      {/* filtros de período */}
      <div className="card card-pad" style={{marginBottom:18}}>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
          <div className="form-group" style={{minWidth:150}}><label>Mês</label>
            <select value={mes} onChange={e=>setMes(parseInt(e.target.value))}>
              {MESES.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
              <option value={0}>— Período personalizado —</option>
            </select></div>
          {mes!==0 && <div className="form-group" style={{minWidth:110}}><label>Ano</label>
            <select value={ano} onChange={e=>setAno(parseInt(e.target.value))}>{anos.map(a=><option key={a}>{a}</option>)}</select></div>}
          {mes===0 && <>
            <div className="form-group"><label>De</label><input type="date" value={ini} onChange={e=>setIni(e.target.value)}/></div>
            <div className="form-group"><label>Até</label><input type="date" value={fim} onChange={e=>setFim(e.target.value)}/></div>
          </>}
          <button className="btn btn-primary" disabled={baixandoLote||comXml.length===0} onClick={baixarLoteXML}>
            {baixandoLote?<span className="spinner"/>:`⬇ Baixar XMLs em lote (${comXml.length})`}</button>
        </div>
      </div>

      {/* resumo do período */}
      <div className="kpi-grid" style={{marginBottom:18}}>
        <div className="kpi-card kpi-blue"><div className="kpi-label">Notas no período</div><div className="kpi-value">{lista.length}</div></div>
        <div className="kpi-card kpi-green"><div className="kpi-label">Autorizadas</div><div className="kpi-value">{autorizadas}</div></div>
        <div className="kpi-card kpi-violet"><div className="kpi-label">Valor total</div><div className="kpi-value" style={{fontSize:20}}>{fmt.moeda(totalValor)}</div></div>
      </div>

      <div className="card card-pad">
        {lista.length===0? <div className="empty-state"><div className="empty-icon">📄</div><div className="empty-title">Nenhuma nota no período</div></div> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Nº</th><th>Data</th><th>Cliente</th><th>Valor</th><th>Status</th><th>Chave</th><th>Download</th></tr></thead>
          <tbody>{lista.map(n=>(
            <tr key={n.id}>
              <td className="cell-strong mono">{n.numero||'—'}</td>
              <td className="mono">{fmt.data(n.data_emissao)}</td>
              <td>{n.destinatario_nome||'—'}</td>
              <td className="cell-money">{fmt.moeda(n.valor_total)}</td>
              <td>{badge(n.status)}</td>
              <td className="mono" style={{fontSize:10}}>{n.chave?n.chave.slice(0,12)+'…':'—'}</td>
              <td><div style={{display:'flex',gap:5}}>
                {n.xml_url && <a className="btn btn-ghost btn-sm" href={n.xml_url} target="_blank" rel="noreferrer">XML</a>}
                {n.danfe_url && <a className="btn btn-ghost btn-sm" href={n.danfe_url} target="_blank" rel="noreferrer">PDF</a>}
                {!n.xml_url && !n.danfe_url && <span style={{color:'var(--text-3)',fontSize:12}}>—</span>}
              </div></td>
            </tr>))}</tbody>
        </table></div>)}
      </div>
    </div>
  );
}

function ListaNotas({notas,toast,reload,emitente}){
  const [filtro,setFiltro]=useState('todas');
  const lista=filtro==='todas'?notas:notas.filter(n=>n.status===filtro);

  async function romaneio(n){
    // busca os itens da nota
    const {data:itens}=await supabase.from('itens_nfe').select('*').eq('nota_id',n.id).order('ordem');
    const esc=(s)=>(s||'').toString().replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
    const linhas=(itens||[]).map((it,i)=>`
      <tr>
        <td style="text-align:center">${i+1}</td>
        <td>${esc(it.descricao)}</td>
        <td style="text-align:center">${esc(it.ncm)}</td>
        <td style="text-align:center">${esc(it.cfop)}</td>
        <td style="text-align:center">${esc(it.unidade)}</td>
        <td style="text-align:right">${Number(it.quantidade).toLocaleString('pt-BR')}</td>
        <td style="text-align:right">${fmt.moeda(it.valor_unitario)}</td>
        <td style="text-align:right">${fmt.moeda(it.valor_total)}</td>
      </tr>`).join('');
    const html=`<!doctype html><html><head><meta charset="utf-8"><title>Romaneio ${n.numero||''}</title>
      <style>
        *{font-family:Arial,Helvetica,sans-serif;box-sizing:border-box}
        body{margin:0;padding:30px;color:#1a1d29;font-size:13px}
        .head{display:flex;justify-content:space-between;border-bottom:3px solid #1d4ed8;padding-bottom:14px;margin-bottom:6px}
        .emit{font-size:18px;font-weight:bold;color:#1d4ed8}
        .doc-title{text-align:right}
        .doc-title h1{margin:0;font-size:20px}
        .doc-title .sub{color:#666;font-size:12px}
        .box{border:1px solid #ccc;border-radius:6px;padding:12px 14px;margin:12px 0}
        .box h3{margin:0 0 8px;font-size:12px;text-transform:uppercase;color:#888;letter-spacing:.5px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px}
        table{width:100%;border-collapse:collapse;margin-top:6px}
        th{background:#1d4ed8;color:#fff;padding:7px 6px;font-size:11px;text-align:left}
        td{padding:6px;border-bottom:1px solid #eee;font-size:12px}
        .tot{text-align:right;margin-top:14px;font-size:15px;font-weight:bold}
        .status{display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:bold}
        .rodape{margin-top:30px;text-align:center;color:#999;font-size:11px;border-top:1px solid #eee;padding-top:12px}
        .aviso{background:#fffbeb;border:1px solid #fde68a;color:#b45309;padding:8px 12px;border-radius:6px;font-size:11px;margin-top:14px}
        @media print{.noprint{display:none}}
      </style></head><body>
      <div class="head">
        <div style="display:flex;align-items:center;gap:14px">
          ${emitente?.logo_url?`<img src="${emitente.logo_url}" alt="" style="max-height:64px;max-width:160px;object-fit:contain"/>`:''}
          <div><div class="emit">${esc(emitente?.razao_social||'Stone NFe')}</div>
            <div style="font-size:11px;color:#666">CNPJ: ${esc(emitente?.cnpj||'')} · IE: ${esc(emitente?.ie||'')}</div>
            <div style="font-size:11px;color:#666">${esc(emitente?.endereco||'')}, ${esc(emitente?.municipio||'')}/${esc(emitente?.uf||'')}</div>
          </div>
        </div>
        <div class="doc-title"><h1>ROMANEIO</h1><div class="sub">Espelho da NF-e · não é documento fiscal</div>
          <div style="margin-top:6px">Nº <b>${n.numero||'—'}</b> / Série ${n.serie||'—'}</div>
          <div style="font-size:11px">Emissão: ${fmt.data(n.data_emissao)}</div>
        </div>
      </div>

      <div class="box"><h3>Cliente</h3>
        <div style="font-weight:bold;font-size:14px">${esc(n.destinatario_nome)}</div>
      </div>

      <div class="box"><h3>Dados da Operação</h3>
        <div class="grid">
          <div><b>Natureza:</b> ${esc(n.natureza||'—')}</div>
          <div><b>CFOP:</b> ${esc(n.cfop||'—')}</div>
          <div><b>Status:</b> ${esc((n.status||'').toUpperCase())}</div>
          <div><b>Chave:</b> <span style="font-size:10px">${esc(n.chave||'pendente')}</span></div>
        </div>
      </div>

      <table>
        <thead><tr><th>#</th><th>Descrição</th><th>NCM</th><th>CFOP</th><th>Un</th><th style="text-align:right">Qtd</th><th style="text-align:right">Vlr Unit</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${linhas||'<tr><td colspan=8 style="text-align:center;color:#999">Sem itens</td></tr>'}</tbody>
      </table>

      <div class="tot">Valor dos Produtos: ${fmt.moeda(n.valor_produtos)}<br>
        ${n.valor_frete>0?`Frete: ${fmt.moeda(n.valor_frete)}<br>`:''}
        <span style="color:#1d4ed8">Total da Nota: ${fmt.moeda(n.valor_total)}</span></div>

      ${n.info_adicionais?`<div class="box"><h3>Informações Adicionais</h3>${esc(n.info_adicionais)}</div>`:''}

      <div class="aviso">⚠ Este romaneio é um espelho interno para conferência. O documento fiscal válido é o DANFE/XML autorizado pela SEFAZ.</div>

      <div class="rodape">Gerado por Stone NFe · ${new Date().toLocaleString('pt-BR')}</div>

      <div class="noprint" style="text-align:center;margin-top:20px">
        <button onclick="window.print()" style="padding:10px 24px;background:#1d4ed8;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer">🖨 Imprimir / Salvar PDF</button>
      </div>
      <script>setTimeout(()=>window.print(),400)</script>
      </body></html>`;
    const w=window.open('','_blank');
    if(!w){toast('Permita pop-ups para gerar o romaneio','error');return;}
    w.document.write(html); w.document.close();
  }

  async function reconsultar(n){
    if(!n.focus_ref){toast('Esta nota não tem referência de transmissão.','error');return;}
    toast('Consultando SEFAZ...','info');
    try{
      const r=await fetch('/api/consultar?ref='+encodeURIComponent(n.focus_ref));
      const d=await r.json();
      const upd={status:d.status_app,mensagem_sefaz:d.mensagem_sefaz||null};
      if(d.chave) upd.chave=d.chave;
      if(d.protocolo) upd.protocolo=d.protocolo;
      if(d.caminho_xml) upd.xml_url=d.base_url+d.caminho_xml;
      if(d.caminho_danfe) upd.danfe_url=d.base_url+d.caminho_danfe;
      await supabase.from('notas_fiscais').update(upd).eq('id',n.id);
      toast(d.status_app==='autorizada'?'Autorizada! ✓':d.status_app==='rejeitada'?('Rejeitada: '+(d.mensagem_sefaz||'')):'Ainda processando','info');
      reload();
    }catch(e){toast('Erro ao consultar: '+e.message,'error');}
  }

  async function cancelarNota(n){
    if(n.status!=='autorizada'){toast('Só é possível cancelar notas autorizadas.','error');return;}
    // Aviso de prazo (24h)
    if(n.data_emissao || n.created_at){
      const base = new Date(n.created_at || n.data_emissao);
      const horas = (Date.now() - base.getTime())/36e5;
      if(horas > 24){
        const segue = window.confirm('Atenção: já se passaram mais de 24h da emissão. A SEFAZ pode recusar o cancelamento.\n\nDeseja tentar mesmo assim?');
        if(!segue) return;
      }
    }
    const just = window.prompt('Justificativa do cancelamento (mínimo 15 caracteres):','');
    if(just===null) return; // cancelou o prompt
    if(just.trim().length < 15){ toast('A justificativa precisa ter no mínimo 15 caracteres.','error'); return; }

    toast('Enviando cancelamento à SEFAZ...','info');
    try{
      const r=await fetch('/api/cancelar',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ref:n.focus_ref, justificativa:just.trim()})
      });
      const d=await r.json();
      if(d.ok){
        await supabase.from('notas_fiscais').update({
          status:'cancelada',
          mensagem_sefaz: d.mensagem || 'Cancelada',
          justificativa_cancelamento: just.trim(),
        }).eq('id',n.id);
        toast('NF-e cancelada com sucesso. ✓','info');
        reload();
      }else{
        toast('Não cancelou: '+(d.erro||'erro desconhecido'),'error');
      }
    }catch(e){ toast('Erro ao cancelar: '+e.message,'error'); }
  }

  async function limparTestes(){
    // Protege autorizadas e canceladas — só remove rascunho/erro/processando/rejeitada
    const apagaveis = notas.filter(n=>!['autorizada','cancelada'].includes(n.status));
    if(apagaveis.length===0){toast('Não há notas de teste para limpar.','info');return;}
    const ok = window.confirm(
      `Isso vai EXCLUIR ${apagaveis.length} nota(s) de teste (rejeitadas, com erro ou em processamento).\n\n`+
      `As notas AUTORIZADAS e CANCELADAS serão preservadas.\n\nDeseja continuar?`);
    if(!ok) return;
    try{
      const ids = apagaveis.map(n=>n.id);
      // apaga itens filhos primeiro (evita erro de chave estrangeira)
      await supabase.from('itens_nfe').delete().in('nota_id', ids);
      const {error} = await supabase.from('notas_fiscais').delete().in('id', ids);
      if(error) throw error;
      toast(`${apagaveis.length} nota(s) de teste removida(s). ✓`,'info');
      reload();
    }catch(e){ toast('Erro ao limpar: '+e.message,'error'); }
  }

  return (
    <div className="page">
      <PageHeader titulo="Notas Emitidas" sub={`${notas.length} no período`}/>
      <div className="tabs" style={{display:'flex',alignItems:'center'}}>{['todas','autorizada','rascunho','processando','rejeitada','cancelada'].map(f=>(
        <button key={f} className={`tab ${filtro===f?'active':''}`} onClick={()=>setFiltro(f)}>
          {f[0].toUpperCase()+f.slice(1)}{f!=='todas'&&<span style={{marginLeft:5,opacity:.6}}>({notas.filter(n=>n.status===f).length})</span>}
        </button>))}
        {notas.some(n=>!['autorizada','cancelada'].includes(n.status)) && (
          <button onClick={limparTestes} title="Remove notas rejeitadas, com erro ou em processamento. Preserva autorizadas."
            style={{marginLeft:'auto',background:'transparent',border:'1px solid var(--border-2)',color:'var(--text-2)',
              padding:'6px 12px',borderRadius:8,cursor:'pointer',fontSize:13}}>
            🧹 Limpar testes
          </button>)}
      </div>
      <div className="card card-pad">
        {lista.length===0? <div className="empty-state"><div className="empty-icon">📄</div><div className="empty-title">Nenhuma nota</div></div> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Nº/Série</th><th>Cliente</th><th>Emissão</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>{lista.map(n=>(
            <tr key={n.id}>
              <td className="mono cell-strong">{n.numero?`${n.numero}/${n.serie}`:'—'}</td>
              <td className="cell-strong" style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.destinatario_nome}</td>
              <td className="mono">{fmt.data(n.data_emissao)}</td>
              <td className="cell-money">{fmt.moeda(n.valor_total)}</td><td>{getStatusBadge(n.status)}</td>
              <td>
                <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                  {n.status==='processando' && <button className="btn btn-ghost btn-sm" onClick={()=>reconsultar(n)}>↻ Status</button>}
                  <button className="btn btn-ghost btn-sm" onClick={()=>romaneio(n)}>📋 Romaneio</button>
                  {n.status==='rejeitada' && n.mensagem_sefaz && <button className="btn btn-ghost btn-sm" title={n.mensagem_sefaz} onClick={()=>toast(n.mensagem_sefaz,'error')}>⚠ Motivo</button>}
                  {n.danfe_url && <a className="btn btn-ghost btn-sm" href={n.danfe_url} target="_blank" rel="noreferrer">PDF</a>}
                  {n.xml_url && <a className="btn btn-ghost btn-sm" href={n.xml_url} target="_blank" rel="noreferrer">XML</a>}
                  {n.status==='autorizada' && <button className="btn btn-ghost btn-sm" style={{color:'var(--red-600)'}} onClick={()=>cancelarNota(n)}>✕ Cancelar</button>}
                  {!['processando','rejeitada'].includes(n.status) && !n.danfe_url && <span style={{color:'var(--text-3)',fontSize:12}}>—</span>}
                </div>
              </td>
            </tr>))}</tbody>
        </table></div>)}
      </div>
    </div>
  );
}

// ============================================================
// CONFIGURAÇÕES (emitente — upsert no Supabase)
// ============================================================
function Configuracoes({tenantId,emitente,tenant,reload,toast}){
  const [tab,setTab]=useState('empresa');
  const [saving,setSaving]=useState(false);
  const [certFile,setCertFile]=useState(null);
  const [certSenha,setCertSenha]=useState('');
  const [enviandoCert,setEnviandoCert]=useState(false);
  const base={razao_social:'',nome_fantasia:'',cnpj:'',ie:'',crt:'1',endereco:'',numero:'',bairro:'',
    municipio:'',uf:'ES',cep:'',telefone:'',email:'',logo_url:'',focus_token:'',focus_ambiente:'homologacao',serie_nfe:1,
    cod_municipio:'',
    cont_nome:'',cont_cpf:'',cont_crc:'',cont_cnpj:'',cont_cep:'',cont_endereco:'',cont_numero:'',
    cont_complemento:'',cont_bairro:'',cont_telefone:'',cont_email:'',cont_cod_municipio:''};
  const [form,setForm]=useState(emitente?{...base,...emitente}:base);
  useEffect(()=>{ if(emitente) setForm({...base,...emitente}); },[emitente]);

  async function salvar(){
    if(!form.razao_social||!form.cnpj){toast('Preencha razão social e CNPJ','error');return;}
    if(!validaCNPJ(form.cnpj)){toast('CNPJ inválido — confira os números','error');return;}
    if(form.cep && !validaCEP(form.cep)){toast('CEP inválido (precisa ter 8 dígitos)','error');return;}
    setSaving(true);
    const payload={tenant_id:tenantId,razao_social:form.razao_social,nome_fantasia:form.nome_fantasia,
      cnpj:form.cnpj,ie:form.ie,crt:form.crt,endereco:form.endereco,numero:form.numero,bairro:form.bairro,
      municipio:form.municipio,uf:form.uf,cep:form.cep,telefone:form.telefone,email:form.email,logo_url:form.logo_url||null,
      focus_token:form.focus_token,focus_ambiente:form.focus_ambiente,serie_nfe:parseInt(form.serie_nfe)||1,
      cod_municipio:form.cod_municipio||null,
      cont_nome:form.cont_nome||null,cont_cpf:form.cont_cpf||null,cont_crc:form.cont_crc||null,
      cont_cnpj:form.cont_cnpj||null,cont_cep:form.cont_cep||null,cont_endereco:form.cont_endereco||null,
      cont_numero:form.cont_numero||null,cont_complemento:form.cont_complemento||null,cont_bairro:form.cont_bairro||null,
      cont_telefone:form.cont_telefone||null,cont_email:form.cont_email||null,cont_cod_municipio:form.cont_cod_municipio||null};
    let error;
    if(emitente?.id){({error}=await supabase.from('emitentes').update(payload).eq('id',emitente.id));}
    else{({error}=await supabase.from('emitentes').insert(payload));}
    setSaving(false);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast('Configurações salvas','success');reload();
  }

  // Carrega a logo da empresa, redimensiona (máx 400px) e guarda como data URL
  function carregarLogo(file){
    if(!file) return;
    if(!file.type.startsWith('image/')){toast('Selecione um arquivo de imagem','error');return;}
    const reader=new FileReader();
    reader.onload=(e)=>{
      const img=new Image();
      img.onload=()=>{
        const max=400;
        let{width,height}=img;
        if(width>max||height>max){
          if(width>height){height=Math.round(height*max/width);width=max;}
          else{width=Math.round(width*max/height);height=max;}
        }
        const canvas=document.createElement('canvas');
        canvas.width=width;canvas.height=height;
        canvas.getContext('2d').drawImage(img,0,0,width,height);
        const dataUrl=canvas.toDataURL('image/png');
        setForm(p=>({...p,logo_url:dataUrl}));
        toast('Logo carregada. Clique em Salvar para confirmar.','info');
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Lê o .pfx escolhido e converte para base64 (sem prefixo data:)
  function lerArquivoBase64(file){
    return new Promise((resolve,reject)=>{
      const r=new FileReader();
      r.onload=()=>resolve(r.result.split(',')[1]);
      r.onerror=()=>reject(new Error('Falha ao ler o arquivo'));
      r.readAsDataURL(file);
    });
  }

  async function enviarCertificado(){
    if(!emitente?.id){toast('Salve os dados da empresa antes de enviar o certificado','error');return;}
    if(!certFile){toast('Selecione o arquivo .pfx do certificado','error');return;}
    if(!certSenha){toast('Informe a senha do certificado','error');return;}
    setEnviandoCert(true);
    try{
      const b64=await lerArquivoBase64(certFile);
      const resp=await fetch('/api/cadastrar-empresa',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          empresa:{razao_social:form.razao_social,nome_fantasia:form.nome_fantasia,cnpj:form.cnpj,
            ie:form.ie,regime:form.crt==='1'?'1':'3',endereco:form.endereco,numero:form.numero,
            bairro:form.bairro,municipio:form.municipio,uf:form.uf,cep:form.cep},
          certificado_base64:b64,
          certificado_senha:certSenha,
        }),
      });
      const out=await resp.json();
      // limpa a senha da memória da tela imediatamente
      setCertSenha(''); setCertFile(null);
      if(!resp.ok||out.erro){toast('Erro: '+(out.erro||'falha no envio'),'error');setEnviandoCert(false);return;}
      // grava só os METADADOS (nada sensível) no banco
      await supabase.from('emitentes').update({
        focus_empresa_id:out.focus_empresa_id||null,
        focus_token_homolog:out.token_homologacao||null,
        focus_token_prod:out.token_producao||null,
        certificado_status:'enviado',
        certificado_validade:out.certificado_validade||null,
        certificado_cnpj:out.certificado_cnpj||null,
        certificado_atualizado_em:new Date().toISOString(),
      }).eq('id',emitente.id);
      toast('Certificado enviado e empresa cadastrada na Focus NFe ✓','success');
      reload();
    }catch(e){toast('Erro: '+e.message,'error');}
    setEnviandoCert(false);
  }

  return (
    <div className="page">
      <PageHeader titulo="Configurações" sub="Emitente, fiscal, Focus NFe e plano"
        acao={<button className="btn btn-primary" disabled={saving} onClick={salvar}>{saving?<span className="spinner"/>:'Salvar'}</button>}/>
      <div className="tabs">{[['empresa','Empresa'],['fiscal','Dados Fiscais'],['contabilista','Contabilista'],['focusnfe','Focus NFe / Certificado']].map(([k,l])=>(
        <button key={k} className={`tab ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{l}</button>))}</div>

      <div className="card card-pad">
        {tab==='empresa' && (
          <div className="form-grid form-grid-2" style={{gap:14}}>
            <div className="alert alert-info col-2" style={{marginBottom:4}}>ℹ Os dados cadastrais da empresa são definidos pela NVX Tecnologia. Você pode editar o nome fantasia, telefone e e-mail. Para corrigir razão social, CNPJ ou endereço, entre em contato.</div>
            <div className="form-group col-2"><label>Razão Social</label><input value={form.razao_social} readOnly disabled/></div>
            <div className="form-group"><label>Nome Fantasia</label><input value={form.nome_fantasia} onChange={e=>setForm(p=>({...p,nome_fantasia:e.target.value}))}/></div>
            <div className="form-group"><label>CNPJ</label><input value={form.cnpj} readOnly disabled/></div>
            <div className="form-group col-2"><label>Endereço</label><input value={form.endereco} readOnly disabled/></div>
            <div className="form-group"><label>Número</label><input value={form.numero} readOnly disabled/></div>
            <div className="form-group"><label>Bairro</label><input value={form.bairro} readOnly disabled/></div>
            <div className="form-group"><label>Município</label><input value={form.municipio} readOnly disabled/></div>
            <div className="form-group"><label>UF</label><input value={form.uf} readOnly disabled/></div>
            <div className="form-group"><label>CEP</label><input value={form.cep} readOnly disabled/></div>
            <div className="form-group"><label>Telefone</label><input value={form.telefone} onChange={e=>setForm(p=>({...p,telefone:e.target.value}))}/></div>
            <div className="form-group"><label>E-mail NFe</label><input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div>

            <div className="form-group col-2"><label>Logomarca da empresa (aparece no romaneio e nas notas)</label>
              <div style={{display:'flex',gap:16,alignItems:'center',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:16}}>
                <div style={{width:120,height:90,borderRadius:'var(--radius)',border:'1px dashed var(--border-2)',display:'flex',alignItems:'center',justifyContent:'center',background:'#fff',overflow:'hidden',flexShrink:0}}>
                  {form.logo_url
                    ? <img src={form.logo_url} alt="Logo" style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}/>
                    : <span style={{fontSize:11,color:'var(--text-3)',textAlign:'center'}}>Sem logo</span>}
                </div>
                <div style={{flex:1}}>
                  <input type="file" accept="image/*" onChange={e=>carregarLogo(e.target.files?.[0])}/>
                  <div className="form-hint" style={{marginTop:6}}>PNG ou JPG. A imagem é reduzida automaticamente. Clique em Salvar depois de escolher.</div>
                  {form.logo_url && <button type="button" className="btn btn-ghost btn-sm" style={{marginTop:8}} onClick={()=>setForm(p=>({...p,logo_url:''}))}>Remover logo</button>}
                </div>
              </div>
            </div>
          </div>
        )}
        {tab==='fiscal' && (
          <div className="form-grid form-grid-2" style={{gap:14}}>
            <div className="form-group"><label>Inscrição Estadual</label><input value={form.ie} onChange={e=>setForm(p=>({...p,ie:e.target.value}))}/></div>
            <div className="form-group"><label>Série da NF-e</label><input type="number" value={form.serie_nfe} onChange={e=>setForm(p=>({...p,serie_nfe:e.target.value}))}/></div>
            <div className="form-group col-2"><label>CRT — Regime Tributário</label>
              <select value={form.crt} onChange={e=>setForm(p=>({...p,crt:e.target.value}))}>
                <option value="1">1 — Simples Nacional</option><option value="2">2 — Simples Nacional (excesso sublimite)</option><option value="3">3 — Regime Normal</option></select></div>
            <div className="form-group col-2"><label>Código do Município (IBGE) — 7 dígitos</label>
              <input value={form.cod_municipio} onChange={e=>setForm(p=>({...p,cod_municipio:e.target.value.replace(/\D/g,'').slice(0,7)}))} placeholder="Ex: 3200805"/>
              <span className="form-hint">Usado no SPED Fiscal (registro 0000). Código IBGE do município da empresa.</span></div>
            <div className="alert alert-info col-2">ℹ O CRT define quais CSTs de ICMS são válidos. Simples Nacional usa a Tabela B (101, 102, 400…); Regime Normal usa a Tabela A (00–90).</div>
          </div>
        )}

        {tab==='contabilista' && (
          <div className="form-grid form-grid-2" style={{gap:14}}>
            <div className="alert alert-info col-2">ℹ Dados do responsável contábil, usados no <b>registro 0100 do SPED Fiscal</b>. Preencha para evitar erro na validação do PVA.</div>
            <div className="form-group col-2"><label>Nome do Contabilista</label><input value={form.cont_nome} onChange={e=>setForm(p=>({...p,cont_nome:e.target.value}))} placeholder="Nome completo"/></div>
            <div className="form-group"><label>CPF</label><input value={form.cont_cpf} onChange={e=>setForm(p=>({...p,cont_cpf:e.target.value.replace(/\D/g,'').slice(0,11)}))} placeholder="Somente números"/></div>
            <div className="form-group"><label>CRC</label><input value={form.cont_crc} onChange={e=>setForm(p=>({...p,cont_crc:e.target.value}))} placeholder="Registro no CRC"/></div>
            <div className="form-group"><label>CNPJ (escritório, se houver)</label><input value={form.cont_cnpj} onChange={e=>setForm(p=>({...p,cont_cnpj:e.target.value.replace(/\D/g,'').slice(0,14)}))}/></div>
            <div className="form-group"><label>CEP</label><input value={form.cont_cep} onChange={e=>setForm(p=>({...p,cont_cep:e.target.value.replace(/\D/g,'').slice(0,8)}))}/></div>
            <div className="form-group col-2"><label>Endereço</label><input value={form.cont_endereco} onChange={e=>setForm(p=>({...p,cont_endereco:e.target.value}))}/></div>
            <div className="form-group"><label>Número</label><input value={form.cont_numero} onChange={e=>setForm(p=>({...p,cont_numero:e.target.value}))}/></div>
            <div className="form-group"><label>Complemento</label><input value={form.cont_complemento} onChange={e=>setForm(p=>({...p,cont_complemento:e.target.value}))}/></div>
            <div className="form-group"><label>Bairro</label><input value={form.cont_bairro} onChange={e=>setForm(p=>({...p,cont_bairro:e.target.value}))}/></div>
            <div className="form-group"><label>Cód. Município (IBGE)</label><input value={form.cont_cod_municipio} onChange={e=>setForm(p=>({...p,cont_cod_municipio:e.target.value.replace(/\D/g,'').slice(0,7)}))} placeholder="7 dígitos"/></div>
            <div className="form-group"><label>Telefone</label><input value={form.cont_telefone} onChange={e=>setForm(p=>({...p,cont_telefone:e.target.value}))}/></div>
            <div className="form-group"><label>E-mail</label><input type="email" value={form.cont_email} onChange={e=>setForm(p=>({...p,cont_email:e.target.value}))}/></div>
          </div>
        )}
        {tab==='focusnfe' && (
          <div className="form-grid form-grid-2" style={{gap:14}}>
            <div className="alert alert-info col-2">ℹ O certificado A1 é enviado <strong>diretamente à Focus NFe</strong> e não é armazenado no Stone NFe. Apenas o status e a validade ficam registrados aqui.</div>

            <div className="form-group"><label>Ambiente</label><select value={form.focus_ambiente} onChange={e=>setForm(p=>({...p,focus_ambiente:e.target.value}))}><option value="homologacao">Homologação (testes)</option><option value="producao">Produção (validade fiscal)</option></select></div>

            {/* Status do certificado */}
            <div className="form-group">
              <label>Status do Certificado</label>
              <div style={{padding:'10px 14px',borderRadius:'var(--radius)',border:'1px solid var(--border)',
                background: emitente?.certificado_status==='enviado'?'var(--green-50)':'var(--bg)',
                display:'flex',alignItems:'center',gap:8,fontSize:14,fontWeight:600,
                color: emitente?.certificado_status==='enviado'?'var(--green-600)':'var(--text-3)'}}>
                {emitente?.certificado_status==='enviado'?'● Certificado ativo':'○ Pendente'}
              </div>
            </div>

            {emitente?.certificado_status==='enviado' && (
              <div className="alert alert-info col-2" style={{background:'var(--green-50)',borderColor:'#bbf7d0',color:'var(--green-600)'}}>
                ✓ Empresa cadastrada na Focus NFe.
                {emitente.certificado_validade && <> Certificado válido até <strong>{fmt.data(emitente.certificado_validade)}</strong>.</>}
                {emitente.certificado_cnpj && <> CNPJ: <strong>{emitente.certificado_cnpj}</strong>.</>}
              </div>
            )}

            {/* Upload */}
            <div className="form-group col-2"><label>Certificado Digital A1 (.pfx ou .p12)</label>
              <div style={{background:'var(--bg)',border:'2px dashed var(--border-2)',borderRadius:'var(--radius-lg)',padding:24}}>
                <div style={{textAlign:'center',marginBottom:16}}>
                  <div style={{fontSize:30,marginBottom:6}}>🔐</div>
                  <div className="cell-strong">{emitente?.certificado_status==='enviado'?'Substituir certificado':'Enviar certificado A1'}</div>
                  <div style={{color:'var(--text-3)',fontSize:13,marginTop:4}}>Necessário para emitir notas com validade fiscal.</div>
                </div>
                <div className="form-grid form-grid-2" style={{gap:12}}>
                  <div className="form-group">
                    <label>Arquivo (.pfx)</label>
                    <input type="file" accept=".pfx,.p12" onChange={e=>setCertFile(e.target.files?.[0]||null)}/>
                    {certFile && <span className="form-hint">✓ {certFile.name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Senha do certificado</label>
                    <input type="password" value={certSenha} onChange={e=>setCertSenha(e.target.value)} placeholder="Senha do .pfx" autoComplete="new-password"/>
                  </div>
                </div>
                <div style={{marginTop:16,display:'flex',justifyContent:'flex-end'}}>
                  <button className="btn btn-primary" disabled={enviandoCert||!certFile||!certSenha} onClick={enviarCertificado}>
                    {enviandoCert?<span className="spinner"/>:'Enviar à Focus NFe'}
                  </button>
                </div>
                <div className="alert alert-warning" style={{marginTop:14,fontSize:12}}>
                  ⚠ A senha e o arquivo são usados apenas para o envio à Focus NFe e <strong>não são guardados</strong> pelo Stone NFe. Salve os dados da empresa (aba Empresa) antes de enviar.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// FINANCEIRO — helpers compartilhados
// ============================================================
function statusConta(c){
  // calcula status dinâmico considerando vencimento
  if(c.status==='cancelado') return 'cancelado';
  const pago = Number(c.valor_pago||c.valor_recebido||0);
  const total = Number(c.valor||0);
  if(pago>=total && total>0) return 'quitado';
  if(pago>0 && pago<total) return 'parcial';
  // aberto: verifica se venceu
  const hoje=new Date().toISOString().slice(0,10);
  if(c.data_vencimento && c.data_vencimento<hoje) return 'vencido';
  return 'aberto';
}
function badgeConta(s){
  const map={
    aberto:{c:'badge-rascunho',i:'○',l:'Em aberto'},
    parcial:{c:'badge-processando',i:'◑',l:'Parcial'},
    quitado:{c:'badge-autorizada',i:'●',l:'Quitado'},
    vencido:{c:'badge-rejeitada',i:'!',l:'Vencido'},
    cancelado:{c:'badge-cancelada',i:'—',l:'Cancelado'},
  };
  const x=map[s]||map.aberto;
  return <span className={`badge ${x.c}`}>{x.i} {x.l}</span>;
}
const hojeISO=()=>new Date().toISOString().slice(0,10);
const FORMAS=['Dinheiro','PIX','Boleto','Transferência','Cartão','Cheque'];

// Período padrão = mês atual (primeiro e último dia)
function periodoMesAtual(){
  const d=new Date();
  const ini=new Date(d.getFullYear(),d.getMonth(),1).toISOString().slice(0,10);
  const fim=new Date(d.getFullYear(),d.getMonth()+1,0).toISOString().slice(0,10);
  return {ini,fim};
}
// Atalhos de período prontos
function atalhoPeriodo(tipo){
  const d=new Date(); const y=d.getFullYear(), m=d.getMonth();
  if(tipo==='mes')    return {ini:new Date(y,m,1).toISOString().slice(0,10), fim:new Date(y,m+1,0).toISOString().slice(0,10)};
  if(tipo==='mes_ant')return {ini:new Date(y,m-1,1).toISOString().slice(0,10), fim:new Date(y,m,0).toISOString().slice(0,10)};
  if(tipo==='ano')    return {ini:new Date(y,0,1).toISOString().slice(0,10), fim:new Date(y,11,31).toISOString().slice(0,10)};
  if(tipo==='30dias'){const a=new Date(d);a.setDate(a.getDate()-30);return {ini:a.toISOString().slice(0,10),fim:hojeISO()};}
  if(tipo==='tudo')   return {ini:'2000-01-01', fim:'2099-12-31'};
  return periodoMesAtual();
}
const dentroPeriodo=(data,ini,fim)=> data && data>=ini && data<=fim;

// ============================================================
// CONTAS A RECEBER
// ============================================================
function ContasReceber({tenantId,contas,destinatarios,centrosCusto,reload,toast}){
  const [modal,setModal]=useState(false);
  const [editId,setEditId]=useState(null);
  const [saving,setSaving]=useState(false);
  const [filtro,setFiltro]=useState('todas');
  const [baixaModal,setBaixaModal]=useState(null); // conta sendo baixada
  const vazio={descricao:'',cliente_nome:'',destinatario_id:'',centro_custo_id:'',valor:'',data_emissao:hojeISO(),data_vencimento:hojeISO(),observacoes:''};
  const [form,setForm]=useState(vazio);

  const lista = filtro==='todas'?contas:contas.filter(c=>statusConta(c)===filtro);
  const totalAberto = contas.filter(c=>['aberto','parcial','vencido'].includes(statusConta(c)))
    .reduce((a,c)=>a+(Number(c.valor||0)-Number(c.valor_recebido||0)),0);
  const totalRecebido = contas.reduce((a,c)=>a+Number(c.valor_recebido||0),0);
  const totalVencido = contas.filter(c=>statusConta(c)==='vencido')
    .reduce((a,c)=>a+(Number(c.valor||0)-Number(c.valor_recebido||0)),0);

  function novo(){setForm(vazio);setEditId(null);setModal(true);}
  function editar(c){setForm({...c,valor:String(c.valor),destinatario_id:c.destinatario_id||'',centro_custo_id:c.centro_custo_id||''});setEditId(c.id);setModal(true);}

  async function salvar(){
    if(!form.descricao||!form.valor||!form.data_vencimento){toast('Preencha descrição, valor e vencimento','error');return;}
    setSaving(true);
    const dest=destinatarios.find(d=>d.id===form.destinatario_id);
    const payload={tenant_id:tenantId,descricao:form.descricao,
      cliente_nome:dest?.razao_social||form.cliente_nome||null,
      destinatario_id:form.destinatario_id||null,centro_custo_id:form.centro_custo_id||null,
      valor:parseFloat(form.valor)||0,data_emissao:form.data_emissao,data_vencimento:form.data_vencimento,
      observacoes:form.observacoes};
    let error;
    if(editId){({error}=await supabase.from('contas_receber').update(payload).eq('id',editId));}
    else{({error}=await supabase.from('contas_receber').insert(payload));}
    setSaving(false);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast(editId?'Conta atualizada':'Conta a receber criada','success');setModal(false);reload();
  }

  async function excluir(id){
    const {error}=await supabase.from('contas_receber').delete().eq('id',id);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast('Conta removida','info');reload();
  }

  // Baixa (recebimento): atualiza a conta e lança no caixa
  async function confirmarBaixa(conta, valorReceber, forma){
    const novoRecebido = Number(conta.valor_recebido||0)+Number(valorReceber);
    const quitou = novoRecebido >= Number(conta.valor);
    const {error}=await supabase.from('contas_receber').update({
      valor_recebido:novoRecebido,
      status: quitou?'recebido':'parcial',
      data_recebimento: quitou?hojeISO():null,
      forma_pagamento:forma,
    }).eq('id',conta.id);
    if(error){toast('Erro na baixa: '+error.message,'error');return;}
    // lança entrada no caixa
    await supabase.from('caixa_lancamentos').insert({
      tenant_id:tenantId,tipo:'entrada',descricao:'Recebimento: '+conta.descricao,
      valor:Number(valorReceber),data:hojeISO(),forma_pagamento:forma,categoria:'Recebimento',
      origem:'conta_receber',conta_receber_id:conta.id,centro_custo_id:conta.centro_custo_id||null,
    });
    toast('Recebimento registrado e lançado no caixa ✓','success');
    setBaixaModal(null);reload();
  }

  return (
    <div className="page">
      <PageHeader titulo="Contas a Receber" sub={`${contas.length} lançamentos`}
        acao={<button className="btn btn-primary" onClick={novo}>+ Nova Conta</button>}/>

      <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <div className="stat-card kpi-green"><div className="stat-label">A Receber (em aberto)</div><div className="stat-value" style={{fontSize:22}}>{fmt.moeda(totalAberto)}</div></div>
        <div className="stat-card kpi-green"><div className="stat-label">Já Recebido</div><div className="stat-value" style={{fontSize:22,color:'var(--green-600)'}}>{fmt.moeda(totalRecebido)}</div></div>
        <div className="stat-card kpi-red"><div className="stat-label">Vencido</div><div className="stat-value" style={{fontSize:22,color:'var(--red-500)'}}>{fmt.moeda(totalVencido)}</div></div>
      </div>

      <div className="tabs">{['todas','aberto','vencido','parcial','quitado','cancelado'].map(f=>(
        <button key={f} className={`tab ${filtro===f?'active':''}`} onClick={()=>setFiltro(f)}>
          {f==='todas'?'Todas':f[0].toUpperCase()+f.slice(1)}
        </button>))}</div>

      <div className="card card-pad">
        {lista.length===0? <div className="empty-state"><div className="empty-icon">↘</div><div className="empty-title">Nenhuma conta a receber</div></div> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Descrição</th><th>Cliente</th><th>Vencimento</th><th>Valor</th><th>Recebido</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>{lista.map(c=>{const st=statusConta(c);return(
            <tr key={c.id}>
              <td className="cell-strong">{c.descricao}{c.nota_id&&<span style={{marginLeft:6,fontSize:10,color:'var(--blue-600)'}}>● NF-e</span>}</td>
              <td>{c.cliente_nome||'—'}</td>
              <td className="mono">{fmt.data(c.data_vencimento)}</td>
              <td className="cell-money">{fmt.moeda(c.valor)}</td>
              <td className="mono" style={{color:'var(--green-600)'}}>{fmt.moeda(c.valor_recebido)}</td>
              <td>{badgeConta(st)}</td>
              <td><div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {['aberto','parcial','vencido'].includes(st)&&<button className="btn btn-primary btn-sm" onClick={()=>setBaixaModal(c)}>$ Receber</button>}
                <button className="btn btn-ghost btn-sm" onClick={()=>editar(c)}>✎</button>
                <button className="btn btn-danger btn-sm" onClick={()=>excluir(c.id)}>✕</button>
              </div></td>
            </tr>);})}</tbody>
        </table></div>)}
      </div>

      {/* Modal cadastro */}
      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="modal-header"><div><div className="modal-title">{editId?'Editar':'Nova'} Conta a Receber</div></div><button className="modal-close" onClick={()=>setModal(false)}>×</button></div>
            <div className="modal-body"><div className="form-grid form-grid-2" style={{gap:14}}>
              <div className="form-group col-2"><label>Descrição</label><input value={form.descricao} onChange={e=>setForm(p=>({...p,descricao:e.target.value}))} placeholder="Venda de blocos, NF 123..."/></div>
              <div className="form-group"><label>Cliente</label>
                <select value={form.destinatario_id} onChange={e=>setForm(p=>({...p,destinatario_id:e.target.value}))}>
                  <option value="">— Selecione (opcional) —</option>{destinatarios.map(d=><option key={d.id} value={d.id}>{d.razao_social}</option>)}</select></div>
              <div className="form-group"><label>Centro de Custo</label>
                <select value={form.centro_custo_id} onChange={e=>setForm(p=>({...p,centro_custo_id:e.target.value}))}>
                  <option value="">— Nenhum —</option>{centrosCusto.map(cc=><option key={cc.id} value={cc.id}>{cc.nome}</option>)}</select></div>
              <div className="form-group"><label>Valor (R$)</label><input type="number" step="0.01" value={form.valor} onChange={e=>setForm(p=>({...p,valor:e.target.value}))}/></div>
              <div className="form-group"><label>Vencimento</label><input type="date" value={form.data_vencimento} onChange={e=>setForm(p=>({...p,data_vencimento:e.target.value}))}/></div>
              <div className="form-group col-2"><label>Observações</label><textarea value={form.observacoes} onChange={e=>setForm(p=>({...p,observacoes:e.target.value}))}/></div>
            </div></div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-primary" disabled={saving} onClick={salvar}>{saving?<span className="spinner"/>:'Salvar'}</button></div>
          </div>
        </div>
      )}

      {/* Modal baixa */}
      {baixaModal && <ModalBaixa conta={baixaModal} tipo="receber" onClose={()=>setBaixaModal(null)} onConfirm={confirmarBaixa}/>}
    </div>
  );
}

// ============================================================
// CONTAS A PAGAR
// ============================================================
function ContasPagar({tenantId,contas,centrosCusto,reload,toast}){
  const [modal,setModal]=useState(false);
  const [editId,setEditId]=useState(null);
  const [saving,setSaving]=useState(false);
  const [filtro,setFiltro]=useState('todas');
  const [baixaModal,setBaixaModal]=useState(null);
  const vazio={descricao:'',fornecedor:'',categoria:'',centro_custo_id:'',valor:'',data_emissao:hojeISO(),data_vencimento:hojeISO(),observacoes:''};
  const [form,setForm]=useState(vazio);

  const lista = filtro==='todas'?contas:contas.filter(c=>statusConta(c)===filtro);
  const totalAberto = contas.filter(c=>['aberto','parcial','vencido'].includes(statusConta(c)))
    .reduce((a,c)=>a+(Number(c.valor||0)-Number(c.valor_pago||0)),0);
  const totalPago = contas.reduce((a,c)=>a+Number(c.valor_pago||0),0);
  const totalVencido = contas.filter(c=>statusConta(c)==='vencido')
    .reduce((a,c)=>a+(Number(c.valor||0)-Number(c.valor_pago||0)),0);

  function novo(){setForm(vazio);setEditId(null);setModal(true);}
  function editar(c){setForm({...c,valor:String(c.valor),centro_custo_id:c.centro_custo_id||''});setEditId(c.id);setModal(true);}

  async function salvar(){
    if(!form.descricao||!form.valor||!form.data_vencimento){toast('Preencha descrição, valor e vencimento','error');return;}
    setSaving(true);
    const payload={tenant_id:tenantId,descricao:form.descricao,fornecedor:form.fornecedor||null,
      categoria:form.categoria||null,centro_custo_id:form.centro_custo_id||null,
      valor:parseFloat(form.valor)||0,data_emissao:form.data_emissao,data_vencimento:form.data_vencimento,
      observacoes:form.observacoes};
    let error;
    if(editId){({error}=await supabase.from('contas_pagar').update(payload).eq('id',editId));}
    else{({error}=await supabase.from('contas_pagar').insert(payload));}
    setSaving(false);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast(editId?'Conta atualizada':'Conta a pagar criada','success');setModal(false);reload();
  }

  async function excluir(id){
    const {error}=await supabase.from('contas_pagar').delete().eq('id',id);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast('Conta removida','info');reload();
  }

  async function confirmarBaixa(conta, valorPagar, forma){
    const novoPago = Number(conta.valor_pago||0)+Number(valorPagar);
    const quitou = novoPago >= Number(conta.valor);
    const {error}=await supabase.from('contas_pagar').update({
      valor_pago:novoPago, status: quitou?'pago':'parcial',
      data_pagamento: quitou?hojeISO():null, forma_pagamento:forma,
    }).eq('id',conta.id);
    if(error){toast('Erro na baixa: '+error.message,'error');return;}
    await supabase.from('caixa_lancamentos').insert({
      tenant_id:tenantId,tipo:'saida',descricao:'Pagamento: '+conta.descricao,
      valor:Number(valorPagar),data:hojeISO(),forma_pagamento:forma,categoria:conta.categoria||'Pagamento',
      origem:'conta_pagar',conta_pagar_id:conta.id,centro_custo_id:conta.centro_custo_id||null,
    });
    toast('Pagamento registrado e lançado no caixa ✓','success');
    setBaixaModal(null);reload();
  }

  return (
    <div className="page">
      <PageHeader titulo="Contas a Pagar" sub={`${contas.length} lançamentos`}
        acao={<button className="btn btn-primary" onClick={novo}>+ Nova Conta</button>}/>

      <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <div className="stat-card kpi-red"><div className="stat-label">A Pagar (em aberto)</div><div className="stat-value" style={{fontSize:22}}>{fmt.moeda(totalAberto)}</div></div>
        <div className="stat-card kpi-blue"><div className="stat-label">Já Pago</div><div className="stat-value" style={{fontSize:22,color:'var(--blue-700)'}}>{fmt.moeda(totalPago)}</div></div>
        <div className="stat-card kpi-red"><div className="stat-label">Vencido</div><div className="stat-value" style={{fontSize:22,color:'var(--red-500)'}}>{fmt.moeda(totalVencido)}</div></div>
      </div>

      <div className="tabs">{['todas','aberto','vencido','parcial','quitado','cancelado'].map(f=>(
        <button key={f} className={`tab ${filtro===f?'active':''}`} onClick={()=>setFiltro(f)}>
          {f==='todas'?'Todas':f[0].toUpperCase()+f.slice(1)}
        </button>))}</div>

      <div className="card card-pad">
        {lista.length===0? <div className="empty-state"><div className="empty-icon">↗</div><div className="empty-title">Nenhuma conta a pagar</div></div> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Descrição</th><th>Fornecedor</th><th>Categoria</th><th>Vencimento</th><th>Valor</th><th>Pago</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>{lista.map(c=>{const st=statusConta(c);return(
            <tr key={c.id}>
              <td className="cell-strong">{c.descricao}</td>
              <td>{c.fornecedor||'—'}</td>
              <td style={{fontSize:12,color:'var(--text-3)'}}>{c.categoria||'—'}</td>
              <td className="mono">{fmt.data(c.data_vencimento)}</td>
              <td className="cell-money">{fmt.moeda(c.valor)}</td>
              <td className="mono" style={{color:'var(--blue-700)'}}>{fmt.moeda(c.valor_pago)}</td>
              <td>{badgeConta(st)}</td>
              <td><div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {['aberto','parcial','vencido'].includes(st)&&<button className="btn btn-primary btn-sm" onClick={()=>setBaixaModal(c)}>$ Pagar</button>}
                <button className="btn btn-ghost btn-sm" onClick={()=>editar(c)}>✎</button>
                <button className="btn btn-danger btn-sm" onClick={()=>excluir(c.id)}>✕</button>
              </div></td>
            </tr>);})}</tbody>
        </table></div>)}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="modal-header"><div><div className="modal-title">{editId?'Editar':'Nova'} Conta a Pagar</div></div><button className="modal-close" onClick={()=>setModal(false)}>×</button></div>
            <div className="modal-body"><div className="form-grid form-grid-2" style={{gap:14}}>
              <div className="form-group col-2"><label>Descrição</label><input value={form.descricao} onChange={e=>setForm(p=>({...p,descricao:e.target.value}))} placeholder="Combustível, folha de pagamento..."/></div>
              <div className="form-group"><label>Fornecedor</label><input value={form.fornecedor} onChange={e=>setForm(p=>({...p,fornecedor:e.target.value}))}/></div>
              <div className="form-group"><label>Categoria</label><input value={form.categoria} onChange={e=>setForm(p=>({...p,categoria:e.target.value}))} placeholder="combustível, folha, imposto..."/></div>
              <div className="form-group"><label>Centro de Custo</label>
                <select value={form.centro_custo_id} onChange={e=>setForm(p=>({...p,centro_custo_id:e.target.value}))}>
                  <option value="">— Nenhum —</option>{centrosCusto.map(cc=><option key={cc.id} value={cc.id}>{cc.nome}</option>)}</select></div>
              <div className="form-group"><label>Valor (R$)</label><input type="number" step="0.01" value={form.valor} onChange={e=>setForm(p=>({...p,valor:e.target.value}))}/></div>
              <div className="form-group"><label>Vencimento</label><input type="date" value={form.data_vencimento} onChange={e=>setForm(p=>({...p,data_vencimento:e.target.value}))}/></div>
              <div className="form-group col-2"><label>Observações</label><textarea value={form.observacoes} onChange={e=>setForm(p=>({...p,observacoes:e.target.value}))}/></div>
            </div></div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-primary" disabled={saving} onClick={salvar}>{saving?<span className="spinner"/>:'Salvar'}</button></div>
          </div>
        </div>
      )}

      {baixaModal && <ModalBaixa conta={baixaModal} tipo="pagar" onClose={()=>setBaixaModal(null)} onConfirm={confirmarBaixa}/>}
    </div>
  );
}

// Modal de baixa compartilhado (recebimento ou pagamento)
function ModalBaixa({conta, tipo, onClose, onConfirm}){
  const jaPago = Number(conta.valor_pago||conta.valor_recebido||0);
  const restante = Number(conta.valor)-jaPago;
  const [valor,setValor]=useState(String(restante.toFixed(2)));
  const [forma,setForma]=useState('PIX');
  const [saving,setSaving]=useState(false);
  const verbo = tipo==='receber'?'Receber':'Pagar';

  async function go(){
    const v=parseFloat(valor)||0;
    if(v<=0){return;}
    setSaving(true);
    await onConfirm(conta, v, forma);
    setSaving(false);
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:480}}>
        <div className="modal-header"><div><div className="modal-title">{verbo}</div><div className="modal-sub">{conta.descricao}</div></div><button className="modal-close" onClick={onClose}>×</button></div>
        <div className="modal-body">
          <div style={{background:'var(--bg)',borderRadius:'var(--radius)',padding:14,marginBottom:16,display:'flex',justifyContent:'space-between'}}>
            <div><div className="stat-label">Valor total</div><div className="mono">{fmt.moeda(conta.valor)}</div></div>
            <div style={{textAlign:'right'}}><div className="stat-label">Restante</div><div className="mono" style={{color:'var(--blue-700)'}}>{fmt.moeda(restante)}</div></div>
          </div>
          <div className="form-grid" style={{gap:14}}>
            <div className="form-group"><label>Valor a {verbo.toLowerCase()} (R$)</label><input type="number" step="0.01" value={valor} onChange={e=>setValor(e.target.value)}/>
              <span className="form-hint">Pode ser parcial. Deixe o valor cheio para quitar.</span></div>
            <div className="form-group"><label>Forma de pagamento</label><select value={forma} onChange={e=>setForma(e.target.value)}>{FORMAS.map(f=><option key={f}>{f}</option>)}</select></div>
          </div>
        </div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-primary" disabled={saving} onClick={go}>{saving?<span className="spinner"/>:`Confirmar ${verbo}`}</button></div>
      </div>
    </div>
  );
}

// ============================================================
// CAIXA — saldo filtrado por período, entradas/saídas, lançamento manual
// ============================================================
function Caixa({tenantId,lancamentos,centrosCusto,reload,toast}){
  const pad=periodoMesAtual();
  const [ini,setIni]=useState(pad.ini);
  const [fim,setFim]=useState(pad.fim);
  const [tipoFiltro,setTipoFiltro]=useState('todos'); // todos|entrada|saida
  const [modal,setModal]=useState(false);
  const [saving,setSaving]=useState(false);
  const vazio={tipo:'entrada',descricao:'',valor:'',data:hojeISO(),forma_pagamento:'Dinheiro',categoria:'',centro_custo_id:''};
  const [form,setForm]=useState(vazio);

  const filtrados = lancamentos.filter(l=>
    dentroPeriodo(l.data,ini,fim) && (tipoFiltro==='todos'||l.tipo===tipoFiltro)
  );
  const entradas = filtrados.filter(l=>l.tipo==='entrada').reduce((a,l)=>a+Number(l.valor||0),0);
  const saidas   = filtrados.filter(l=>l.tipo==='saida').reduce((a,l)=>a+Number(l.valor||0),0);
  const saldo    = entradas - saidas;

  function setAtalho(t){const p=atalhoPeriodo(t);setIni(p.ini);setFim(p.fim);}

  async function salvar(){
    if(!form.descricao||!form.valor){toast('Preencha descrição e valor','error');return;}
    setSaving(true);
    const {error}=await supabase.from('caixa_lancamentos').insert({
      tenant_id:tenantId,tipo:form.tipo,descricao:form.descricao,valor:parseFloat(form.valor)||0,
      data:form.data,forma_pagamento:form.forma_pagamento,categoria:form.categoria||null,
      centro_custo_id:form.centro_custo_id||null,origem:'manual',
    });
    setSaving(false);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast('Lançamento registrado','success');setModal(false);setForm(vazio);reload();
  }
  async function excluir(id){
    const {error}=await supabase.from('caixa_lancamentos').delete().eq('id',id);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast('Lançamento removido','info');reload();
  }
  const ccNome=(id)=>centrosCusto.find(c=>c.id===id)?.nome||'';

  return (
    <div className="page">
      <PageHeader titulo="Caixa" sub="Movimentações do período"
        acao={<button className="btn btn-primary" onClick={()=>setModal(true)}>+ Lançamento Manual</button>}/>

      {/* Filtros de período */}
      <div className="card card-pad" style={{marginBottom:18,padding:'16px 20px'}}>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
          <div className="form-group"><label>De</label><input type="date" value={ini} onChange={e=>setIni(e.target.value)} style={{minWidth:150}}/></div>
          <div className="form-group"><label>Até</label><input type="date" value={fim} onChange={e=>setFim(e.target.value)} style={{minWidth:150}}/></div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {[['mes','Este mês'],['mes_ant','Mês passado'],['30dias','30 dias'],['ano','Este ano'],['tudo','Tudo']].map(([k,l])=>(
              <button key={k} className="btn btn-ghost btn-sm" onClick={()=>setAtalho(k)}>{l}</button>))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <div className="stat-card kpi-green"><div className="stat-label">Entradas</div><div className="stat-value" style={{fontSize:24,color:'var(--green-600)'}}>{fmt.moeda(entradas)}</div></div>
        <div className="stat-card kpi-red"><div className="stat-label">Saídas</div><div className="stat-value" style={{fontSize:24,color:'var(--red-500)'}}>{fmt.moeda(saidas)}</div></div>
        <div className="stat-card kpi-blue"><div className="stat-label">Saldo do período</div><div className="stat-value" style={{fontSize:24,color:saldo>=0?'var(--blue-700)':'var(--red-500)'}}>{fmt.moeda(saldo)}</div></div>
      </div>

      <div className="tabs">{[['todos','Todos'],['entrada','Entradas'],['saida','Saídas']].map(([k,l])=>(
        <button key={k} className={`tab ${tipoFiltro===k?'active':''}`} onClick={()=>setTipoFiltro(k)}>{l}</button>))}</div>

      <div className="card card-pad">
        {filtrados.length===0? <div className="empty-state"><div className="empty-icon">💰</div><div className="empty-title">Nenhum lançamento no período</div></div> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Data</th><th>Descrição</th><th>Origem</th><th>Centro de Custo</th><th>Forma</th><th>Valor</th><th></th></tr></thead>
          <tbody>{filtrados.map(l=>(
            <tr key={l.id}>
              <td className="mono">{fmt.data(l.data)}</td>
              <td className="cell-strong">{l.descricao}</td>
              <td><span style={{fontSize:11,color:l.origem==='manual'?'var(--text-3)':'var(--blue-600)'}}>
                {l.origem==='manual'?'Manual':l.origem==='conta_receber'?'↘ Receber':'↗ Pagar'}</span></td>
              <td style={{fontSize:12,color:'var(--text-3)'}}>{ccNome(l.centro_custo_id)||'—'}</td>
              <td style={{fontSize:12,color:'var(--text-3)'}}>{l.forma_pagamento||'—'}</td>
              <td className="mono" style={{fontWeight:700,color:l.tipo==='entrada'?'var(--green-600)':'var(--red-500)'}}>
                {l.tipo==='entrada'?'+ ':'− '}{fmt.moeda(l.valor)}</td>
              <td>{l.origem==='manual' && <button className="btn btn-danger btn-sm" onClick={()=>excluir(l.id)}>✕</button>}</td>
            </tr>))}</tbody>
        </table></div>)}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal" style={{maxWidth:520}}>
            <div className="modal-header"><div><div className="modal-title">Lançamento Manual</div><div className="modal-sub">Entrada ou saída avulsa no caixa</div></div><button className="modal-close" onClick={()=>setModal(false)}>×</button></div>
            <div className="modal-body"><div className="form-grid form-grid-2" style={{gap:14}}>
              <div className="form-group"><label>Tipo</label><select value={form.tipo} onChange={e=>setForm(p=>({...p,tipo:e.target.value}))}><option value="entrada">Entrada (+)</option><option value="saida">Saída (−)</option></select></div>
              <div className="form-group"><label>Data</label><input type="date" value={form.data} onChange={e=>setForm(p=>({...p,data:e.target.value}))}/></div>
              <div className="form-group col-2"><label>Descrição</label><input value={form.descricao} onChange={e=>setForm(p=>({...p,descricao:e.target.value}))} placeholder="Ex: aporte de sócio, despesa em dinheiro..."/></div>
              <div className="form-group"><label>Valor (R$)</label><input type="number" step="0.01" value={form.valor} onChange={e=>setForm(p=>({...p,valor:e.target.value}))}/></div>
              <div className="form-group"><label>Forma</label><select value={form.forma_pagamento} onChange={e=>setForm(p=>({...p,forma_pagamento:e.target.value}))}>{FORMAS.map(f=><option key={f}>{f}</option>)}</select></div>
              <div className="form-group"><label>Categoria</label><input value={form.categoria} onChange={e=>setForm(p=>({...p,categoria:e.target.value}))} placeholder="opcional"/></div>
              <div className="form-group"><label>Centro de Custo</label><select value={form.centro_custo_id} onChange={e=>setForm(p=>({...p,centro_custo_id:e.target.value}))}><option value="">— Nenhum —</option>{centrosCusto.map(cc=><option key={cc.id} value={cc.id}>{cc.nome}</option>)}</select></div>
            </div></div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-primary" disabled={saving} onClick={salvar}>{saving?<span className="spinner"/>:'Lançar'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CENTROS DE CUSTO — gestão + visão de gastos por centro
// ============================================================
function CentrosCusto({tenantId,centros,contasPagar,caixa,reload,toast}){
  const [modal,setModal]=useState(false);
  const [editId,setEditId]=useState(null);
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({nome:'',descricao:''});

  function novo(){setForm({nome:'',descricao:''});setEditId(null);setModal(true);}
  function editar(c){setForm({nome:c.nome,descricao:c.descricao||''});setEditId(c.id);setModal(true);}

  async function salvar(){
    if(!form.nome){toast('Informe o nome do centro de custo','error');return;}
    setSaving(true);
    const payload={tenant_id:tenantId,nome:form.nome,descricao:form.descricao||null};
    let error;
    if(editId){({error}=await supabase.from('centros_custo').update(payload).eq('id',editId));}
    else{({error}=await supabase.from('centros_custo').insert(payload));}
    setSaving(false);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast(editId?'Centro atualizado':'Centro criado','success');setModal(false);reload();
  }
  async function desativar(id){
    const {error}=await supabase.from('centros_custo').update({ativo:false}).eq('id',id);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast('Centro desativado','info');reload();
  }

  // gasto por centro = saídas do caixa atribuídas a ele
  const gastoPorCentro=(id)=> caixa.filter(l=>l.tipo==='saida'&&l.centro_custo_id===id).reduce((a,l)=>a+Number(l.valor||0),0);
  const totalGeral = caixa.filter(l=>l.tipo==='saida').reduce((a,l)=>a+Number(l.valor||0),0);

  return (
    <div className="page">
      <PageHeader titulo="Centros de Custo" sub="Áreas de produção e despesa"
        acao={<button className="btn btn-primary" onClick={novo}>+ Novo Centro</button>}/>

      <div className="card card-pad">
        {centros.length===0? <div className="empty-state"><div className="empty-icon">◎</div><div className="empty-title">Nenhum centro de custo</div></div> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Centro de Custo</th><th>Descrição</th><th>Gasto acumulado</th><th>% do total</th><th></th></tr></thead>
          <tbody>{centros.map(c=>{const g=gastoPorCentro(c.id);const pct=totalGeral>0?(g/totalGeral*100):0;return(
            <tr key={c.id}>
              <td className="cell-strong">{c.nome}</td>
              <td style={{fontSize:13,color:'var(--text-3)'}}>{c.descricao||'—'}</td>
              <td className="cell-money">{fmt.moeda(g)}</td>
              <td style={{minWidth:140}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{flex:1,height:6,background:'var(--border)',borderRadius:3,overflow:'hidden'}}>
                    <div style={{width:pct+'%',height:'100%',background:'linear-gradient(90deg,var(--blue-500),var(--blue-700))'}}/>
                  </div>
                  <span className="mono" style={{fontSize:11,color:'var(--text-3)'}}>{pct.toFixed(0)}%</span>
                </div>
              </td>
              <td><div style={{display:'flex',gap:5}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>editar(c)}>✎</button>
                <button className="btn btn-danger btn-sm" onClick={()=>desativar(c.id)}>✕</button>
              </div></td>
            </tr>);})}</tbody>
        </table></div>)}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal" style={{maxWidth:480}}>
            <div className="modal-header"><div><div className="modal-title">{editId?'Editar':'Novo'} Centro de Custo</div></div><button className="modal-close" onClick={()=>setModal(false)}>×</button></div>
            <div className="modal-body"><div className="form-grid" style={{gap:14}}>
              <div className="form-group"><label>Nome</label><input value={form.nome} onChange={e=>setForm(p=>({...p,nome:e.target.value}))} placeholder="Ex: Extração, Corte..."/></div>
              <div className="form-group"><label>Descrição</label><input value={form.descricao} onChange={e=>setForm(p=>({...p,descricao:e.target.value}))}/></div>
            </div></div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-primary" disabled={saving} onClick={salvar}>{saving?<span className="spinner"/>:'Salvar'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// RELATÓRIOS — visão consolidada com filtros de período
// ============================================================
function Relatorios({notas,contasReceber,contasPagar,caixa,centrosCusto}){
  const pad=periodoMesAtual();
  const [ini,setIni]=useState(pad.ini);
  const [fim,setFim]=useState(pad.fim);
  function setAtalho(t){const p=atalhoPeriodo(t);setIni(p.ini);setFim(p.fim);}

  // Filtra cada conjunto pelo período
  const notasP = notas.filter(n=>dentroPeriodo(n.data_emissao,ini,fim));
  const crP = contasReceber.filter(c=>dentroPeriodo(c.data_vencimento,ini,fim));
  const cpP = contasPagar.filter(c=>dentroPeriodo(c.data_vencimento,ini,fim));
  const cxP = caixa.filter(l=>dentroPeriodo(l.data,ini,fim));

  const faturado = notasP.filter(n=>n.status==='autorizada').reduce((a,n)=>a+Number(n.valor_total||0),0);
  const aReceber = crP.reduce((a,c)=>a+(Number(c.valor||0)-Number(c.valor_recebido||0)),0);
  const aPagar = cpP.reduce((a,c)=>a+(Number(c.valor||0)-Number(c.valor_pago||0)),0);
  const entradas = cxP.filter(l=>l.tipo==='entrada').reduce((a,l)=>a+Number(l.valor||0),0);
  const saidas = cxP.filter(l=>l.tipo==='saida').reduce((a,l)=>a+Number(l.valor||0),0);
  const saldo = entradas - saidas;

  // notas por status
  const porStatus = ['autorizada','processando','rejeitada','rascunho','cancelada'].map(s=>({s,n:notasP.filter(x=>x.status===s).length})).filter(x=>x.n>0);
  // gasto por centro
  const gastoCentro = centrosCusto.map(c=>({nome:c.nome,valor:cxP.filter(l=>l.tipo==='saida'&&l.centro_custo_id===c.id).reduce((a,l)=>a+Number(l.valor||0),0)})).filter(x=>x.valor>0).sort((a,b)=>b.valor-a.valor);
  const maxCentro = Math.max(1,...gastoCentro.map(g=>g.valor));

  return (
    <div className="page">
      <PageHeader titulo="Relatórios" sub="Visão consolidada do período"/>

      <div className="card card-pad" style={{marginBottom:18,padding:'16px 20px'}}>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
          <div className="form-group"><label>De</label><input type="date" value={ini} onChange={e=>setIni(e.target.value)} style={{minWidth:150}}/></div>
          <div className="form-group"><label>Até</label><input type="date" value={fim} onChange={e=>setFim(e.target.value)} style={{minWidth:150}}/></div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {[['mes','Este mês'],['mes_ant','Mês passado'],['30dias','30 dias'],['ano','Este ano'],['tudo','Tudo']].map(([k,l])=>(
              <button key={k} className="btn btn-ghost btn-sm" onClick={()=>setAtalho(k)}>{l}</button>))}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card kpi-blue"><div className="stat-label">Faturado (NF-e)</div><div className="stat-value" style={{fontSize:22}}>{fmt.moeda(faturado)}</div><div className="stat-unit">{notasP.filter(n=>n.status==='autorizada').length} notas</div></div>
        <div className="stat-card kpi-green"><div className="stat-label">A Receber</div><div className="stat-value" style={{fontSize:22,color:'var(--green-600)'}}>{fmt.moeda(aReceber)}</div></div>
        <div className="stat-card kpi-red"><div className="stat-label">A Pagar</div><div className="stat-value" style={{fontSize:22,color:'var(--red-500)'}}>{fmt.moeda(aPagar)}</div></div>
        <div className="stat-card kpi-violet"><div className="stat-label">Saldo de Caixa</div><div className="stat-value" style={{fontSize:22,color:saldo>=0?'var(--blue-700)':'var(--red-500)'}}>{fmt.moeda(saldo)}</div></div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        {/* Fluxo do caixa */}
        <div className="card card-pad">
          <div style={{fontFamily:'var(--font-display)',fontWeight:700,marginBottom:16}}>Fluxo de Caixa</div>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <BarraComp label="Entradas" valor={entradas} max={Math.max(entradas,saidas,1)} cor="var(--green-500)"/>
            <BarraComp label="Saídas" valor={saidas} max={Math.max(entradas,saidas,1)} cor="var(--red-500)"/>
            <div style={{borderTop:'1px solid var(--border)',paddingTop:12,display:'flex',justifyContent:'space-between'}}>
              <span style={{fontWeight:600}}>Saldo</span>
              <span className="cell-money" style={{fontSize:16}}>{fmt.moeda(saldo)}</span>
            </div>
          </div>
        </div>

        {/* Gasto por centro de custo */}
        <div className="card card-pad">
          <div style={{fontFamily:'var(--font-display)',fontWeight:700,marginBottom:16}}>Gasto por Centro de Custo</div>
          {gastoCentro.length===0? <div style={{color:'var(--text-3)',fontSize:14}}>Sem saídas no período.</div> :
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {gastoCentro.map(g=><BarraComp key={g.nome} label={g.nome} valor={g.valor} max={maxCentro} cor="var(--blue-600)"/>)}
            </div>}
        </div>

        {/* Notas por status */}
        <div className="card card-pad">
          <div style={{fontFamily:'var(--font-display)',fontWeight:700,marginBottom:16}}>Notas por Status</div>
          {porStatus.length===0? <div style={{color:'var(--text-3)',fontSize:14}}>Sem notas no período.</div> :
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {porStatus.map(({s,n})=>(
                <div key={s} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  {getStatusBadge(s)}<span className="mono cell-strong">{n}</span>
                </div>))}
            </div>}
        </div>

        {/* Resumo */}
        <div className="card card-pad">
          <div style={{fontFamily:'var(--font-display)',fontWeight:700,marginBottom:16}}>Resumo do Período</div>
          <div style={{display:'flex',flexDirection:'column',gap:10,fontSize:14}}>
            <LinhaResumo l="Notas emitidas" v={notasP.length}/>
            <LinhaResumo l="Faturamento autorizado" v={fmt.moeda(faturado)}/>
            <LinhaResumo l="Contas a receber (aberto)" v={fmt.moeda(aReceber)}/>
            <LinhaResumo l="Contas a pagar (aberto)" v={fmt.moeda(aPagar)}/>
            <LinhaResumo l="Lançamentos no caixa" v={cxP.length}/>
          </div>
        </div>
      </div>
    </div>
  );
}
function BarraComp({label,valor,max,cor}){
  const pct=max>0?(valor/max*100):0;
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:13}}>
        <span style={{color:'var(--text-2)'}}>{label}</span>
        <span className="mono cell-strong">{fmt.moeda(valor)}</span>
      </div>
      <div style={{height:10,background:'var(--border)',borderRadius:5,overflow:'hidden'}}>
        <div style={{width:pct+'%',height:'100%',background:cor,borderRadius:5,transition:'width .4s'}}/>
      </div>
    </div>
  );
}
function LinhaResumo({l,v}){
  return <div style={{display:'flex',justifyContent:'space-between',paddingBottom:8,borderBottom:'1px solid var(--border)'}}>
    <span style={{color:'var(--text-2)'}}>{l}</span><span className="cell-strong">{v}</span></div>;
}

// ============================================================
// USUÁRIOS — gestão de logins do tenant (admin cria com senha provisória)
// ============================================================
function Usuarios({tenantId,perfilAtual,reload,toast}){
  const [usuarios,setUsuarios]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(false);
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({nome:'',email:'',senha:'',papel:'admin'});
  const [editId,setEditId]=useState(null);

  async function carregar(){
    setLoading(true);
    const {data}=await supabase.from('perfis').select('*').eq('tenant_id',tenantId).order('created_at');
    setUsuarios(data||[]); setLoading(false);
  }
  useEffect(()=>{carregar();},[tenantId]);

  function gerarSenha(){
    const s='Stone'+Math.floor(1000+Math.random()*9000)+'!';
    setForm(p=>({...p,senha:s}));
  }

  async function token(){
    const {data}=await supabase.auth.getSession();
    return data.session?.access_token;
  }

  function abrirNovo(){setEditId(null);setForm({nome:'',email:'',senha:'',papel:'operador'});gerarSenha();setModal(true);}
  function abrirEditar(u){setEditId(u.id);setForm({nome:u.nome||'',email:u.email||'',senha:'',papel:u.papel||'admin'});setModal(true);}

  async function editar(){
    if(!form.nome){toast('Informe o nome do usuário','error');return;}
    if(!form.email){toast('Informe o e-mail','error');return;}
    setSaving(true);
    try{
      const t=await token();
      const r=await fetch('/api/usuarios',{method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},
        body:JSON.stringify({acao:'editar',user_id:editId,nome:form.nome,email:form.email,papel:form.papel,senha:form.senha||undefined})});
      const out=await r.json();
      if(!r.ok||out.erro){toast('Erro: '+(out.erro||'falha'),'error');setSaving(false);return;}
      toast('Usuário atualizado','success');
      setModal(false);setForm({nome:'',email:'',senha:'',papel:'admin'});setEditId(null);carregar();
    }catch(e){toast('Erro: '+e.message,'error');}
    setSaving(false);
  }

  async function criar(){
    if(!form.nome){toast('Informe o nome do usuário','error');return;}
    if(!form.email||!form.senha){toast('Preencha e-mail e senha','error');return;}
    // limite por tipo: 3 operacionais + 1 contador
    if(form.papel==='contador'){
      if(qtdCont>=LIMITE_CONT){toast('A versão Start permite apenas 1 contador','error');return;}
    } else {
      if(qtdOper>=LIMITE_OPER){toast('A versão Start permite até 3 usuários operacionais','error');return;}
    }
    setSaving(true);
    try{
      const t=await token();
      const r=await fetch('/api/usuarios',{method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},
        body:JSON.stringify({acao:'criar',email:form.email,nome:form.nome,senha:form.senha,papel:form.papel,tenant_id:tenantId})});
      const out=await r.json();
      if(!r.ok||out.erro){toast('Erro: '+(out.erro||'falha'),'error');setSaving(false);return;}
      toast('Usuário criado. Anote a senha provisória e repasse ao usuário.','success');
      setModal(false);setForm({nome:'',email:'',senha:'',papel:'admin'});carregar();
    }catch(e){toast('Erro: '+e.message,'error');}
    setSaving(false);
  }

  async function resetar(u){
    const nova='Stone'+Math.floor(1000+Math.random()*9000)+'!';
    const t=await token();
    const r=await fetch('/api/usuarios',{method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},
      body:JSON.stringify({acao:'resetar',user_id:u.id,senha:nova})});
    const out=await r.json();
    if(out.ok) toast('Nova senha provisória: '+nova,'success');
    else toast('Erro ao redefinir senha','error');
  }

  async function toggleAtivo(u){
    const t=await token();
    const acao=u.ativo?'desativar':'ativar';
    const r=await fetch('/api/usuarios',{method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},
      body:JSON.stringify({acao,user_id:u.id})});
    const out=await r.json();
    if(out.ok){toast(u.ativo?'Usuário desativado':'Usuário reativado','info');carregar();}
    else toast('Erro: '+(out.erro||'falha'),'error');
  }

  const souAdmin = perfilAtual?.papel==='admin';
  const LIMITE_OPER = 3;   // versão Start: até 3 operacionais (admin/operador)
  const LIMITE_CONT = 1;   // + 1 contador
  const ativosLista = usuarios.filter(u=>u.ativo!==false);
  const qtdOper = ativosLista.filter(u=>u.papel!=='contador').length;
  const qtdCont = ativosLista.filter(u=>u.papel==='contador').length;
  const operCheio = qtdOper >= LIMITE_OPER;
  const contCheio = qtdCont >= LIMITE_CONT;
  const tudoCheio = operCheio && contCheio;

  return (
    <div className="page">
      <PageHeader titulo="Usuários" sub={`${qtdOper}/${LIMITE_OPER} operacionais · ${qtdCont}/${LIMITE_CONT} contador · versão Start`}
        acao={souAdmin && <button className="btn btn-primary" disabled={tudoCheio} onClick={abrirNovo}>+ Novo Usuário</button>}/>

      {!souAdmin && <div className="alert alert-warning" style={{marginBottom:18}}>Apenas administradores podem gerenciar usuários.</div>}
      {souAdmin && tudoCheio && <div className="alert alert-info" style={{marginBottom:18}}>ℹ A versão <strong>Start</strong> permite até {LIMITE_OPER} usuários operacionais + {LIMITE_CONT} contador. Para adicionar mais, será necessário um plano superior.</div>}

      <div className="card card-pad">
        {loading? <div className="empty-state"><span className="spinner"/></div> :
         usuarios.length===0? <div className="empty-state"><div className="empty-icon">◍</div><div className="empty-title">Nenhum usuário</div></div> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Nome</th><th>E-mail</th><th>Papel</th><th>Status</th>{souAdmin&&<th>Ações</th>}</tr></thead>
          <tbody>{usuarios.map(u=>(
            <tr key={u.id}>
              <td className="cell-strong">{u.nome||'—'}{u.id===perfilAtual?.id&&<span style={{marginLeft:6,fontSize:10,color:'var(--blue-600)'}}>(você)</span>}</td>
              <td>{u.email||'—'}</td>
              <td><span className="badge badge-autorizada" style={{textTransform:'capitalize'}}>{u.super_admin?'Super-admin':u.papel}</span></td>
              <td>{u.ativo!==false? <span className="badge badge-autorizada">● Ativo</span> : <span className="badge badge-cancelada">○ Inativo</span>}</td>
              {souAdmin && <td><div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {u.id!==perfilAtual?.id && <>
                  <button className="btn btn-ghost btn-sm" onClick={()=>abrirEditar(u)}>✎ Editar</button>
                  <button className="btn btn-ghost btn-sm" onClick={()=>resetar(u)}>↻ Senha</button>
                  <button className={`btn btn-sm ${u.ativo!==false?'btn-danger':'btn-ghost'}`} onClick={()=>toggleAtivo(u)}>{u.ativo!==false?'Desativar':'Ativar'}</button>
                </>}
              </div></td>}
            </tr>))}</tbody>
        </table></div>)}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal" style={{maxWidth:520}}>
            <div className="modal-header"><div><div className="modal-title">{editId?'Editar Usuário':'Novo Usuário'}</div><div className="modal-sub">{editId?'Altere os dados do usuário':'Crie um login com senha provisória'}</div></div><button className="modal-close" onClick={()=>setModal(false)}>×</button></div>
            <div className="modal-body"><div className="form-grid" style={{gap:14}}>
              <div className="form-group"><label>Nome</label><input value={form.nome} onChange={e=>setForm(p=>({...p,nome:e.target.value}))} placeholder="Nome do usuário"/></div>
              <div className="form-group"><label>E-mail (login)</label><input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="usuario@empresa.com" autoComplete="off"/></div>
              <div className="form-group"><label>Papel</label>
                <select value={form.papel} onChange={e=>setForm(p=>({...p,papel:e.target.value}))}>
                  <option value="admin">Administrador</option><option value="operador">Operador</option><option value="contador">Contador</option></select></div>
              <div className="form-group"><label>{editId?'Nova senha (deixe vazio para manter)':'Senha provisória'}</label>
                <div style={{display:'flex',gap:8}}>
                  <input value={form.senha} onChange={e=>setForm(p=>({...p,senha:e.target.value}))} placeholder={editId?'Manter senha atual':''}/>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={gerarSenha}>Gerar</button>
                </div>
                <span className="form-hint">{editId?'Só preencha se quiser trocar a senha.':'Anote e repasse ao usuário. Ele poderá trocar depois.'}</span>
              </div>
              {!editId && <div className="alert alert-info" style={{fontSize:12}}>O novo usuário terá acesso aos dados desta empresa. Use e-mails de pessoas de confiança.</div>}
            </div></div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-primary" disabled={saving} onClick={editId?editar:criar}>{saving?<span className="spinner"/>:(editId?'Salvar':'Criar Usuário')}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// BLOCOS — cadastro de blocos de granito
// ============================================================
function Blocos({tenantId,blocos,produtos,reload,toast}){
  const [modal,setModal]=useState(false);
  const [editId,setEditId]=useState(null);
  const [saving,setSaving]=useState(false);
  const [filtro,setFiltro]=useState('todos');
  const vazio={numero_bloco:'',produto_id:'',classificacao:'A',data_producao:hojeISO(),
    comp_bruto:'',alt_bruto:'',larg_bruto:'',comp_liq:'',alt_liq:'',larg_liq:'',
    moeda:'BRL',cotacao_dolar:'',preco_m3:'',status:'disponivel',observacoes:''};
  const [form,setForm]=useState(vazio);

  // cálculos de volume
  const m3=(c,a,l)=>{const v=(parseFloat(c)||0)*(parseFloat(a)||0)*(parseFloat(l)||0);return Math.round(v*1000)/1000;};
  const m3Bruto=m3(form.comp_bruto,form.alt_bruto,form.larg_bruto);
  const m3Liq=m3(form.comp_liq,form.alt_liq,form.larg_liq);
  const valorTotal=Math.round((m3Liq*(parseFloat(form.preco_m3)||0))*100)/100;

  const lista=filtro==='todos'?blocos:blocos.filter(b=>b.status===filtro);
  const simboloMoeda=(m)=>m==='USD'?'US$':'R$';
  const fmtMoedaBloco=(v,m)=> (m==='USD'?'US$ ':'R$ ')+Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});

  function novo(){setForm(vazio);setEditId(null);setModal(true);}
  function editar(b){setForm({
    numero_bloco:b.numero_bloco,produto_id:b.produto_id||'',classificacao:b.classificacao||'A',
    data_producao:b.data_producao||hojeISO(),comp_bruto:b.comp_bruto||'',alt_bruto:b.alt_bruto||'',larg_bruto:b.larg_bruto||'',
    comp_liq:b.comp_liq||'',alt_liq:b.alt_liq||'',larg_liq:b.larg_liq||'',moeda:b.moeda||'BRL',
    cotacao_dolar:b.cotacao_dolar||'',preco_m3:b.preco_m3||'',status:b.status||'disponivel',observacoes:b.observacoes||''});
    setEditId(b.id);setModal(true);}

  async function salvar(){
    if(!form.numero_bloco){toast('Informe o número do bloco','error');return;}
    if(!form.preco_m3){toast('Informe o preço por m³','error');return;}
    if(form.moeda==='USD' && !form.cotacao_dolar){toast('Informe a cotação do dólar','error');return;}
    setSaving(true);
    const prod=produtos.find(p=>p.id===form.produto_id);
    const payload={tenant_id:tenantId,produto_id:form.produto_id||null,produto_nome:prod?.descricao||null,
      numero_bloco:form.numero_bloco,classificacao:form.classificacao,data_producao:form.data_producao,
      comp_bruto:parseFloat(form.comp_bruto)||0,alt_bruto:parseFloat(form.alt_bruto)||0,larg_bruto:parseFloat(form.larg_bruto)||0,m3_bruto:m3Bruto,
      comp_liq:parseFloat(form.comp_liq)||0,alt_liq:parseFloat(form.alt_liq)||0,larg_liq:parseFloat(form.larg_liq)||0,m3_liquido:m3Liq,
      moeda:form.moeda,cotacao_dolar:form.moeda==='USD'?(parseFloat(form.cotacao_dolar)||null):null,
      preco_m3:parseFloat(form.preco_m3)||0,valor_total:valorTotal,status:form.status,observacoes:form.observacoes};
    let error;
    if(editId){({error}=await supabase.from('blocos').update(payload).eq('id',editId));}
    else{({error}=await supabase.from('blocos').insert(payload));}
    setSaving(false);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast(editId?'Bloco atualizado':'Bloco cadastrado','success');setModal(false);reload();
  }
  async function excluir(id){
    const {error}=await supabase.from('blocos').delete().eq('id',id);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast('Bloco removido','info');reload();
  }

  const badgeStatus=(s)=>{
    const m={disponivel:{c:'badge-autorizada',l:'Disponível'},reservado:{c:'badge-processando',l:'Reservado'},vendido:{c:'badge-cancelada',l:'Vendido'}};
    const x=m[s]||m.disponivel; return <span className={`badge ${x.c}`}>{x.l}</span>;
  };

  return (
    <div className="page">
      <PageHeader titulo="Blocos" sub={`${blocos.length} blocos cadastrados`}
        acao={<button className="btn btn-primary" onClick={novo}>+ Novo Bloco</button>}/>

      <div className="tabs">{[['todos','Todos'],['disponivel','Disponíveis'],['reservado','Reservados'],['vendido','Vendidos']].map(([k,l])=>(
        <button key={k} className={`tab ${filtro===k?'active':''}`} onClick={()=>setFiltro(k)}>{l}</button>))}</div>

      <div className="card card-pad">
        {lista.length===0? <div className="empty-state"><div className="empty-icon">⬚</div><div className="empty-title">Nenhum bloco</div><div>Cadastre os blocos de granito da pedreira</div></div> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Nº Bloco</th><th>Produto</th><th>Class.</th><th>m³ Líq.</th><th>Preço/m³</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>{lista.map(b=>(
            <tr key={b.id}>
              <td className="cell-strong mono">{b.numero_bloco}</td>
              <td>{b.produto_nome||'—'}</td>
              <td style={{textAlign:'center'}}>{b.classificacao}</td>
              <td className="mono">{Number(b.m3_liquido).toLocaleString('pt-BR')} m³</td>
              <td className="mono">{fmtMoedaBloco(b.preco_m3,b.moeda)}</td>
              <td className="cell-money">{fmtMoedaBloco(b.valor_total,b.moeda)}</td>
              <td>{badgeStatus(b.status)}</td>
              <td><div style={{display:'flex',gap:5}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>editar(b)}>✎</button>
                <button className="btn btn-danger btn-sm" onClick={()=>excluir(b.id)}>✕</button>
              </div></td>
            </tr>))}</tbody>
        </table></div>)}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal modal-lg modal-compacto">
            <div className="modal-header"><div><div className="modal-title">{editId?'Editar':'Novo'} Bloco</div></div><button className="modal-close" onClick={()=>setModal(false)}>×</button></div>
            <div className="modal-body" style={{padding:'18px 22px'}}>
              <div className="form-grid form-grid-3" style={{gap:10}}>
                <div className="form-group"><label>Número do Bloco *</label><input value={form.numero_bloco} onChange={e=>setForm(p=>({...p,numero_bloco:e.target.value}))} placeholder="Ex: VMC-001"/></div>
                <div className="form-group"><label>Produto</label>
                  <select value={form.produto_id} onChange={e=>setForm(p=>({...p,produto_id:e.target.value}))}>
                    <option value="">— Selecione —</option>{produtos.map(pr=><option key={pr.id} value={pr.id}>{pr.descricao}</option>)}</select></div>
                <div className="form-group"><label>Classificação</label>
                  <select value={form.classificacao} onChange={e=>setForm(p=>({...p,classificacao:e.target.value}))}>{['A','B','C','D'].map(c=><option key={c}>{c}</option>)}</select></div>
                <div className="form-group"><label>Data de Produção</label><input type="date" value={form.data_producao} onChange={e=>setForm(p=>({...p,data_producao:e.target.value}))}/></div>
              </div>

              {/* Medidas brutas e líquidas lado a lado, compactas */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,margin:'10px 0'}}>
                <div style={{background:'var(--bg)',borderRadius:'var(--radius)',padding:'10px 12px'}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:'.5px',textTransform:'uppercase',color:'var(--text-3)',marginBottom:6,textAlign:'left'}}>Medidas Brutas (m)</div>
                  <div style={{display:'flex',gap:6}}>
                    <input type="number" step="0.01" placeholder="Comp." value={form.comp_bruto} onChange={e=>setForm(p=>({...p,comp_bruto:e.target.value}))} style={{padding:'6px 8px',fontSize:13}}/>
                    <input type="number" step="0.01" placeholder="Alt." value={form.alt_bruto} onChange={e=>setForm(p=>({...p,alt_bruto:e.target.value}))} style={{padding:'6px 8px',fontSize:13}}/>
                    <input type="number" step="0.01" placeholder="Larg." value={form.larg_bruto} onChange={e=>setForm(p=>({...p,larg_bruto:e.target.value}))} style={{padding:'6px 8px',fontSize:13}}/>
                  </div>
                  <div style={{textAlign:'right',marginTop:5,fontFamily:'var(--font-display)',fontWeight:700,fontSize:14}}>{m3Bruto.toLocaleString('pt-BR')} m³</div>
                </div>
                <div style={{background:'var(--green-50)',borderRadius:'var(--radius)',padding:'10px 12px'}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:'.5px',textTransform:'uppercase',color:'var(--green-600)',marginBottom:6,textAlign:'left'}}>Medidas Líquidas (m)</div>
                  <div style={{display:'flex',gap:6}}>
                    <input type="number" step="0.01" placeholder="Comp." value={form.comp_liq} onChange={e=>setForm(p=>({...p,comp_liq:e.target.value}))} style={{padding:'6px 8px',fontSize:13}}/>
                    <input type="number" step="0.01" placeholder="Alt." value={form.alt_liq} onChange={e=>setForm(p=>({...p,alt_liq:e.target.value}))} style={{padding:'6px 8px',fontSize:13}}/>
                    <input type="number" step="0.01" placeholder="Larg." value={form.larg_liq} onChange={e=>setForm(p=>({...p,larg_liq:e.target.value}))} style={{padding:'6px 8px',fontSize:13}}/>
                  </div>
                  <div style={{textAlign:'right',marginTop:5,fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,color:'var(--green-600)'}}>{m3Liq.toLocaleString('pt-BR')} m³</div>
                </div>
              </div>

              {/* Valores */}
              <div className="form-grid form-grid-3" style={{gap:10}}>
                <div className="form-group"><label>Moeda</label>
                  <select value={form.moeda} onChange={e=>setForm(p=>({...p,moeda:e.target.value}))}>
                    <option value="BRL">R$ (Real)</option><option value="USD">US$ (Dólar)</option></select></div>
                {form.moeda==='USD' && (
                  <div className="form-group"><label>Cotação do Dólar (R$)</label><input type="number" step="0.0001" value={form.cotacao_dolar} onChange={e=>setForm(p=>({...p,cotacao_dolar:e.target.value}))} placeholder="Ex: 5.45"/></div>
                )}
                <div className="form-group"><label>Preço por m³ *</label><input type="number" step="0.01" value={form.preco_m3} onChange={e=>setForm(p=>({...p,preco_m3:e.target.value}))}/></div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                    <option value="disponivel">Disponível</option><option value="reservado">Reservado</option><option value="vendido">Vendido</option></select></div>
                <div className="form-group col-3"><label>Observações</label><textarea value={form.observacoes} onChange={e=>setForm(p=>({...p,observacoes:e.target.value}))}/></div>
              </div>

              {/* Resumo do valor */}
              <div style={{marginTop:12,padding:'12px 16px',borderRadius:'var(--radius)',background:'linear-gradient(135deg,var(--blue-50),#fff)',border:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div className="stat-label">Valor Total do Bloco</div>
                  <div style={{fontSize:11,color:'var(--text-3)'}}>{m3Liq.toLocaleString('pt-BR')} m³ × {fmtMoedaBloco(form.preco_m3,form.moeda)}/m³</div>
                </div>
                <div style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:800,color:'var(--blue-700)'}}>{fmtMoedaBloco(valorTotal,form.moeda)}</div>
              </div>
              {form.moeda==='USD' && form.cotacao_dolar && (
                <div style={{textAlign:'right',marginTop:6,fontSize:13,color:'var(--text-2)'}}>≈ R$ {(valorTotal*(parseFloat(form.cotacao_dolar)||0)).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})} (convertido)</div>
              )}
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-primary" disabled={saving} onClick={salvar}>{saving?<span className="spinner"/>:'Salvar Bloco'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PARÂMETROS FISCAIS — CFOPs, Naturezas e Tributação padrão
// ============================================================
function ParametrosFiscais({tenantId,cfops,naturezas,observacoes=[],cfopDepara=[],emitente,reload,toast}){
  const [aba,setAba]=useState('cfops');
  const [novoCfop,setNovoCfop]=useState({codigo:'',descricao:''});
  const [novaNat,setNovaNat]=useState({descricao:'',cfop_padrao:''});
  const [novaObs,setNovaObs]=useState({titulo:'',texto:''});
  const [novoDp,setNovoDp]=useState({cfop_origem:'',finalidade:'',cfop_escrituracao:'',descricao:''});
  const [trib,setTrib]=useState({icms_aliquota_padrao:emitente?.icms_aliquota_padrao??12,cst_padrao:emitente?.cst_padrao||'00',crt:emitente?.crt||'3'});
  const [salvandoTrib,setSalvandoTrib]=useState(false);

  async function addDepara(){
    if(!novoDp.cfop_origem||!novoDp.finalidade||!novoDp.cfop_escrituracao){toast('Preencha CFOP origem, finalidade e CFOP escrituração','error');return;}
    const {error}=await supabase.from('cfop_depara').insert({tenant_id:tenantId,...novoDp});
    if(error){toast('Erro: '+error.message,'error');return;}
    setNovoDp({cfop_origem:'',finalidade:'',cfop_escrituracao:'',descricao:''});
    toast('Regra de de-para adicionada','success');reload();
  }
  async function delDepara(id){
    const {error}=await supabase.from('cfop_depara').delete().eq('id',id);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast('Regra removida','info');reload();
  }

  async function addObs(){
    if(!novaObs.titulo||!novaObs.texto){toast('Preencha título e texto','error');return;}
    const {error}=await supabase.from('observacoes_padrao').insert({tenant_id:tenantId,titulo:novaObs.titulo,texto:novaObs.texto});
    if(error){toast('Erro: '+error.message,'error');return;}
    setNovaObs({titulo:'',texto:''});toast('Observação adicionada','success');reload();
  }
  async function delObs(id){
    const {error}=await supabase.from('observacoes_padrao').delete().eq('id',id);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast('Observação removida','info');reload();
  }

  async function addCfop(){
    if(!novoCfop.codigo||!novoCfop.descricao){toast('Preencha código e descrição','error');return;}
    const {error}=await supabase.from('cfops').insert({tenant_id:tenantId,codigo:novoCfop.codigo,descricao:novoCfop.descricao});
    if(error){toast('Erro: '+error.message,'error');return;}
    setNovoCfop({codigo:'',descricao:''});toast('CFOP adicionado','success');reload();
  }
  async function delCfop(id){
    const {error}=await supabase.from('cfops').delete().eq('id',id);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast('CFOP removido','info');reload();
  }
  async function addNat(){
    if(!novaNat.descricao){toast('Preencha a descrição','error');return;}
    const {error}=await supabase.from('naturezas_operacao').insert({tenant_id:tenantId,descricao:novaNat.descricao,cfop_padrao:novaNat.cfop_padrao||null});
    if(error){toast('Erro: '+error.message,'error');return;}
    setNovaNat({descricao:'',cfop_padrao:''});toast('Natureza adicionada','success');reload();
  }
  async function delNat(id){
    const {error}=await supabase.from('naturezas_operacao').delete().eq('id',id);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast('Natureza removida','info');reload();
  }
  async function salvarTrib(){
    setSalvandoTrib(true);
    const {error}=await supabase.from('emitentes').update({
      icms_aliquota_padrao:parseFloat(trib.icms_aliquota_padrao)||0,
      cst_padrao:trib.cst_padrao, crt:trib.crt,
    }).eq('id',emitente.id);
    setSalvandoTrib(false);
    if(error){toast('Erro: '+error.message,'error');return;}
    toast('Tributação padrão salva','success');reload();
  }

  return (
    <div className="page">
      <PageHeader titulo="Parâmetros Fiscais" sub="CFOPs, naturezas de operação e tributação padrão"/>

      <div className="tabs">{[['cfops','CFOPs'],['naturezas','Naturezas de Operação'],['tributacao','Tributação'],['observacoes','Observações da Nota'],['depara','De-para CFOP (Entrada)']].map(([k,l])=>(
        <button key={k} className={`tab ${aba===k?'active':''}`} onClick={()=>setAba(k)}>{l}</button>))}</div>

      {aba==='cfops' && (
        <div className="card card-pad">
          <div className="form-grid" style={{gridTemplateColumns:'140px 1fr auto',gap:10,alignItems:'end',marginBottom:16}}>
            <div className="form-group"><label>Código</label><input value={novoCfop.codigo} onChange={e=>setNovoCfop(p=>({...p,codigo:e.target.value}))} placeholder="6102"/></div>
            <div className="form-group"><label>Descrição</label><input value={novoCfop.descricao} onChange={e=>setNovoCfop(p=>({...p,descricao:e.target.value}))} placeholder="Venda de mercadoria..."/></div>
            <button className="btn btn-primary" onClick={addCfop}>+ Adicionar</button>
          </div>
          {cfops.length===0? <div className="empty-state"><div className="empty-title">Nenhum CFOP cadastrado</div></div> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Código</th><th>Descrição</th><th></th></tr></thead>
            <tbody>{cfops.map(c=>(
              <tr key={c.id}><td className="cell-strong mono">{c.codigo}</td><td>{c.descricao}</td>
                <td style={{textAlign:'right'}}><button className="btn btn-danger btn-sm" onClick={()=>delCfop(c.id)}>✕</button></td></tr>
            ))}</tbody>
          </table></div>)}
        </div>
      )}

      {aba==='naturezas' && (
        <div className="card card-pad">
          <div className="form-grid" style={{gridTemplateColumns:'1fr 140px auto',gap:10,alignItems:'end',marginBottom:16}}>
            <div className="form-group"><label>Descrição da Natureza</label><input value={novaNat.descricao} onChange={e=>setNovaNat(p=>({...p,descricao:e.target.value}))} placeholder="Venda de produção do estabelecimento"/></div>
            <div className="form-group"><label>CFOP padrão</label><input value={novaNat.cfop_padrao} onChange={e=>setNovaNat(p=>({...p,cfop_padrao:e.target.value}))} placeholder="6101"/></div>
            <button className="btn btn-primary" onClick={addNat}>+ Adicionar</button>
          </div>
          {naturezas.length===0? <div className="empty-state"><div className="empty-title">Nenhuma natureza cadastrada</div></div> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Descrição</th><th>CFOP padrão</th><th></th></tr></thead>
            <tbody>{naturezas.map(n=>(
              <tr key={n.id}><td className="cell-strong">{n.descricao}</td><td className="mono">{n.cfop_padrao||'—'}</td>
                <td style={{textAlign:'right'}}><button className="btn btn-danger btn-sm" onClick={()=>delNat(n.id)}>✕</button></td></tr>
            ))}</tbody>
          </table></div>)}
        </div>
      )}

      {aba==='tributacao' && (
        <div className="card card-pad" style={{maxWidth:560}}>
          <div className="alert alert-info" style={{marginBottom:16}}>ℹ Valores padrão usados ao emitir. Podem ser ajustados nota a nota.</div>
          <div className="form-grid form-grid-2" style={{gap:14}}>
            <div className="form-group"><label>Regime Tributário (CRT)</label>
              <select value={trib.crt} onChange={e=>setTrib(p=>({...p,crt:e.target.value}))}>
                <option value="1">1 - Simples Nacional</option>
                <option value="2">2 - Simples Nacional (excesso de sublimite)</option>
                <option value="3">3 - Regime Normal</option>
              </select></div>
            <div className="form-group"><label>Alíquota ICMS padrão (%)</label><input type="number" step="0.01" value={trib.icms_aliquota_padrao} onChange={e=>setTrib(p=>({...p,icms_aliquota_padrao:e.target.value}))}/></div>
            <div className="form-group"><label>CST padrão</label><input value={trib.cst_padrao} onChange={e=>setTrib(p=>({...p,cst_padrao:e.target.value}))} placeholder="00"/></div>
          </div>
          <button className="btn btn-primary" disabled={salvandoTrib} style={{marginTop:14}} onClick={salvarTrib}>{salvandoTrib?<span className="spinner"/>:'Salvar tributação'}</button>
        </div>
      )}

      {aba==='observacoes' && (
        <div className="card card-pad">
          <div className="alert alert-info" style={{marginBottom:16}}>ℹ Cadastre textos reutilizáveis. Na emissão, você clica para adicionar ao campo de observações (pode juntar vários).</div>
          <div className="form-grid" style={{gridTemplateColumns:'200px 1fr auto',gap:10,alignItems:'end',marginBottom:16}}>
            <div className="form-group"><label>Título</label><input value={novaObs.titulo} onChange={e=>setNovaObs(p=>({...p,titulo:e.target.value}))} placeholder="Ex: Mercadoria FOB"/></div>
            <div className="form-group"><label>Texto da observação</label><input value={novaObs.texto} onChange={e=>setNovaObs(p=>({...p,texto:e.target.value}))} placeholder="Texto que será inserido na nota"/></div>
            <button className="btn btn-primary" onClick={addObs}>+ Adicionar</button>
          </div>
          {observacoes.length===0? <div className="empty-state"><div className="empty-title">Nenhuma observação cadastrada</div></div> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Título</th><th>Texto</th><th></th></tr></thead>
            <tbody>{observacoes.map(o=>(
              <tr key={o.id}><td className="cell-strong">{o.titulo}</td><td style={{color:'var(--text-2)'}}>{o.texto}</td>
                <td style={{textAlign:'right'}}><button className="btn btn-danger btn-sm" onClick={()=>delObs(o.id)}>✕</button></td></tr>
            ))}</tbody>
          </table></div>)}
        </div>
      )}

      {aba==='depara' && (
        <div className="card card-pad">
          <div className="alert alert-info" style={{marginBottom:16}}>ℹ Regras de conversão de CFOP para escrituração de entradas. Ex: CFOP de origem 6101 + finalidade "Revenda" → escritura como 2102.</div>
          <div className="form-grid" style={{gridTemplateColumns:'110px 1fr 130px 1fr auto',gap:10,alignItems:'end',marginBottom:16}}>
            <div className="form-group"><label>CFOP Origem</label><input value={novoDp.cfop_origem} onChange={e=>setNovoDp(p=>({...p,cfop_origem:e.target.value.replace(/\D/g,'').slice(0,4)}))} placeholder="6101"/></div>
            <div className="form-group"><label>Finalidade</label><input value={novoDp.finalidade} onChange={e=>setNovoDp(p=>({...p,finalidade:e.target.value}))} placeholder="Revenda"/></div>
            <div className="form-group"><label>CFOP Escrit.</label><input value={novoDp.cfop_escrituracao} onChange={e=>setNovoDp(p=>({...p,cfop_escrituracao:e.target.value.replace(/\D/g,'').slice(0,4)}))} placeholder="2102"/></div>
            <div className="form-group"><label>Descrição</label><input value={novoDp.descricao} onChange={e=>setNovoDp(p=>({...p,descricao:e.target.value}))} placeholder="Opcional"/></div>
            <button className="btn btn-primary" onClick={addDepara}>+ Adicionar</button>
          </div>
          {cfopDepara.length===0? <div className="empty-state"><div className="empty-title">Nenhuma regra cadastrada</div></div> : (
          <div className="table-wrap"><table>
            <thead><tr><th>CFOP Origem</th><th>Finalidade</th><th>CFOP Escrituração</th><th>Descrição</th><th></th></tr></thead>
            <tbody>{cfopDepara.map(r=>(
              <tr key={r.id}>
                <td className="mono">{r.cfop_origem}</td><td>{r.finalidade}</td>
                <td className="mono cell-strong">{r.cfop_escrituracao}</td><td style={{color:'var(--text-2)'}}>{r.descricao||'—'}</td>
                <td style={{textAlign:'right'}}><button className="btn btn-danger btn-sm" onClick={()=>delDepara(r.id)}>✕</button></td>
              </tr>))}</tbody>
          </table></div>)}
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADMIN PANEL — painel da plataforma (/admin), só super_admin
// ============================================================
function AdminPanel({session,toast,sair}){
  const [clientes,setClientes]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(false);
  const [saving,setSaving]=useState(false);
  // detalhes do cliente
  const [detModal,setDetModal]=useState(false);
  const [detLoading,setDetLoading]=useState(false);
  const [det,setDet]=useState(null);        // {cliente,empresa,usuarios,pagamentos,metricas}
  const [editForm,setEditForm]=useState(null); // edição inline dos campos do cliente
  const [pgForm,setPgForm]=useState({competencia:'',valor:'',forma:'pix',data_pagamento:''});
  const vazio={razao_social:'',nome_fantasia:'',cnpj:'',endereco:'',numero:'',bairro:'',municipio:'',uf:'ES',cep:'',
    plano:'Start',valor_mensal:'',dia_vencimento:'',usuario_nome:'',usuario_email:'',usuario_senha:''};
  const [form,setForm]=useState(vazio);

  const token=async()=>(await supabase.auth.getSession()).data.session?.access_token;
  async function chamarAdmin(payload){
    const t=await token();
    const r=await fetch('/api/admin-clientes',{method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},
      body:JSON.stringify(payload)});
    return r.json();
  }

  async function carregar(){
    setLoading(true);
    try{
      const t=await token();
      const r=await fetch('/api/admin-clientes',{method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},
        body:JSON.stringify({acao:'listar'})});
      const out=await r.json();
      if(out.ok) setClientes(out.clientes||[]);
      else toast('Erro ao listar: '+(out.erro||''),'error');
    }catch(e){toast('Erro: '+e.message,'error');}
    setLoading(false);
  }
  useEffect(()=>{carregar();},[]);

  function gerarSenha(){
    const c='abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let s='';for(let i=0;i<10;i++)s+=c[Math.floor(Math.random()*c.length)];
    setForm(p=>({...p,usuario_senha:s}));
  }
  function abrirNovo(){setForm(vazio);gerarSenha();setModal(true);}

  async function criarCliente(){
    if(!form.razao_social||!form.cnpj){toast('Razão social e CNPJ obrigatórios','error');return;}
    if(!validaCNPJ(form.cnpj)){toast('CNPJ inválido','error');return;}
    if(!form.usuario_nome||!form.usuario_email||!form.usuario_senha){toast('Preencha os dados do usuário principal','error');return;}
    setSaving(true);
    try{
      const t=await token();
      const r=await fetch('/api/admin-clientes',{method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},
        body:JSON.stringify({acao:'criar_cliente',...form,
          valor_mensal:form.valor_mensal?parseFloat(form.valor_mensal):null,
          dia_vencimento:form.dia_vencimento?parseInt(form.dia_vencimento):null})});
      const out=await r.json();
      if(!r.ok||!out.ok){toast('Erro: '+(out.erro||'falha'),'error');setSaving(false);return;}
      toast('Cliente criado com sucesso!','success');
      setModal(false);carregar();
    }catch(e){toast('Erro: '+e.message,'error');}
    setSaving(false);
  }

  async function mudarStatus(c,novo){
    try{
      const t=await token();
      await fetch('/api/admin-clientes',{method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},
        body:JSON.stringify({acao:'status',tenant_id:c.id,status_assinatura:novo,ativo:novo!=='suspenso'})});
      toast('Status atualizado','success');carregar();
    }catch(e){toast('Erro: '+e.message,'error');}
  }

  const badgePlano=(p)=>{const m={Start:'badge-processando',Pro:'badge-autorizada',Export:'badge-info'};return <span className={`badge ${m[p]||'badge-info'}`}>{p}</span>;};
  const fmtBRL=(v)=>v?('R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2})):'—';

  async function abrirDetalhes(c){
    setDetModal(true);setDetLoading(true);setDet(null);
    const out=await chamarAdmin({acao:'detalhes',tenant_id:c.id});
    if(out.ok){
      setDet(out);
      setEditForm({plano:out.cliente.plano||'Start',valor_mensal:out.cliente.valor_mensal||'',
        dia_vencimento:out.cliente.dia_vencimento||'',nome_fantasia:out.empresa?.nome_fantasia||'',
        razao_social:out.empresa?.razao_social||'',observacoes_admin:out.cliente.observacoes_admin||''});
      // sugere a competência do mês atual no form de pagamento
      setPgForm(p=>({...p,competencia:new Date().toISOString().slice(0,7),valor:out.cliente.valor_mensal||''}));
    } else toast('Erro: '+(out.erro||''),'error');
    setDetLoading(false);
  }

  async function salvarEdicao(){
    if(!det) return;
    setSaving(true);
    const out=await chamarAdmin({acao:'editar_cliente',tenant_id:det.cliente.id,...editForm,
      valor_mensal:editForm.valor_mensal?parseFloat(editForm.valor_mensal):null,
      dia_vencimento:editForm.dia_vencimento?parseInt(editForm.dia_vencimento):null});
    setSaving(false);
    if(out.ok){toast('Cliente atualizado','success');abrirDetalhes(det.cliente);carregar();}
    else toast('Erro: '+(out.erro||''),'error');
  }

  async function registrarPagamento(){
    if(!det||!pgForm.competencia){toast('Informe a competência (mês)','error');return;}
    const out=await chamarAdmin({acao:'registrar_pagamento',tenant_id:det.cliente.id,
      competencia:pgForm.competencia,valor:pgForm.valor?parseFloat(pgForm.valor):null,
      status:'pago',forma:pgForm.forma,data_pagamento:pgForm.data_pagamento||new Date().toISOString().slice(0,10)});
    if(out.ok){toast('Pagamento registrado','success');abrirDetalhes(det.cliente);}
    else toast('Erro: '+(out.erro||''),'error');
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      {/* topo do admin */}
      <div style={{background:'linear-gradient(100deg,#16306b,#1e448f 55%,#2657b0)',padding:'16px 28px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src="/logo_symbol.png" alt="" style={{width:34,height:34,borderRadius:8}}/>
          <div>
            <div style={{color:'#fff',fontFamily:'var(--font-display)',fontWeight:800,fontSize:18}}>Stone NFe <span style={{fontWeight:400,opacity:0.8}}>Admin</span></div>
            <div style={{color:'#bcd0f5',fontSize:12}}>Painel da plataforma · NVX Tecnologia</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{color:'#fff',borderColor:'rgba(255,255,255,0.3)'}} onClick={sair}>Sair</button>
      </div>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'24px 28px'}}>
        {/* KPIs */}
        <div className="kpi-grid" style={{marginBottom:20}}>
          <div className="kpi-card kpi-blue"><div className="kpi-label">Total de Clientes</div><div className="kpi-value">{clientes.length}</div></div>
          <div className="kpi-card kpi-green"><div className="kpi-label">Ativos</div><div className="kpi-value">{clientes.filter(c=>c.ativo!==false).length}</div></div>
          <div className="kpi-card kpi-red"><div className="kpi-label">Suspensos</div><div className="kpi-value">{clientes.filter(c=>c.status_assinatura==='suspenso').length}</div></div>
          <div className="kpi-card kpi-violet"><div className="kpi-label">Receita Mensal</div><div className="kpi-value" style={{fontSize:20}}>{fmtBRL(clientes.reduce((s,c)=>s+(parseFloat(c.valor_mensal)||0),0))}</div></div>
        </div>

        <div className="card card-pad">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div style={{fontFamily:'var(--font-display)',fontSize:18,fontWeight:700}}>Clientes</div>
            <button className="btn btn-primary" onClick={abrirNovo}>+ Novo Cliente</button>
          </div>
          {loading? <div className="empty-state"><span className="spinner"/></div> :
           clientes.length===0? <div className="empty-state"><div className="empty-title">Nenhum cliente ainda</div></div> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Empresa</th><th>Plano</th><th>Mensal</th><th>Venc.</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>{clientes.map(c=>(
                <tr key={c.id}>
                  <td className="cell-strong">{c.nome}</td>
                  <td>{badgePlano(c.plano)}</td>
                  <td className="mono">{fmtBRL(c.valor_mensal)}</td>
                  <td style={{textAlign:'center'}}>{c.dia_vencimento?`dia ${c.dia_vencimento}`:'—'}</td>
                  <td><span className={`badge ${c.status_assinatura==='suspenso'?'badge-cancelada':'badge-autorizada'}`}>{c.status_assinatura||'ativo'}</span></td>
                  <td><div style={{display:'flex',gap:5}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>abrirDetalhes(c)}>Detalhes</button>
                    {c.status_assinatura!=='suspenso'
                      ? <button className="btn btn-danger btn-sm" onClick={()=>mudarStatus(c,'suspenso')}>Suspender</button>
                      : <button className="btn btn-ghost btn-sm" onClick={()=>mudarStatus(c,'ativo')}>Reativar</button>}
                  </div></td>
                </tr>))}</tbody>
            </table></div>)}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header"><div><div className="modal-title">Novo Cliente</div><div className="modal-sub">Cria empresa + usuário principal + assinatura</div></div><button className="modal-close" onClick={()=>setModal(false)}>×</button></div>
            <div className="modal-body">
              <div style={{fontFamily:'var(--font-display)',fontWeight:700,marginBottom:10,color:'var(--blue-700)'}}>Dados da Empresa</div>
              <div className="form-grid form-grid-2" style={{gap:12}}>
                <div className="form-group col-2"><label>Razão Social *</label><input value={form.razao_social} onChange={e=>setForm(p=>({...p,razao_social:e.target.value}))}/></div>
                <div className="form-group"><label>Nome Fantasia</label><input value={form.nome_fantasia} onChange={e=>setForm(p=>({...p,nome_fantasia:e.target.value}))}/></div>
                <div className="form-group"><label>CNPJ *</label><input value={form.cnpj} onChange={e=>setForm(p=>({...p,cnpj:maskCNPJ(e.target.value)}))}/></div>
                <div className="form-group col-2"><label>Endereço</label><input value={form.endereco} onChange={e=>setForm(p=>({...p,endereco:e.target.value}))}/></div>
                <div className="form-group"><label>Número</label><input value={form.numero} onChange={e=>setForm(p=>({...p,numero:e.target.value}))}/></div>
                <div className="form-group"><label>Bairro</label><input value={form.bairro} onChange={e=>setForm(p=>({...p,bairro:e.target.value}))}/></div>
                <div className="form-group"><label>Município</label><input value={form.municipio} onChange={e=>setForm(p=>({...p,municipio:e.target.value}))}/></div>
                <div className="form-group"><label>UF</label><select value={form.uf} onChange={e=>setForm(p=>({...p,uf:e.target.value}))}>{UFs.map(u=><option key={u}>{u}</option>)}</select></div>
                <div className="form-group"><label>CEP</label><input value={form.cep} onChange={e=>setForm(p=>({...p,cep:maskCEP(e.target.value)}))}/></div>
              </div>

              <div style={{fontFamily:'var(--font-display)',fontWeight:700,margin:'18px 0 10px',color:'var(--blue-700)'}}>Assinatura</div>
              <div className="form-grid form-grid-3" style={{gap:12}}>
                <div className="form-group"><label>Plano</label><select value={form.plano} onChange={e=>setForm(p=>({...p,plano:e.target.value}))}><option>Start</option><option>Pro</option><option>Export</option></select></div>
                <div className="form-group"><label>Valor Mensal (R$)</label><input type="number" step="0.01" value={form.valor_mensal} onChange={e=>setForm(p=>({...p,valor_mensal:e.target.value}))}/></div>
                <div className="form-group"><label>Dia Vencimento</label><input type="number" min="1" max="28" value={form.dia_vencimento} onChange={e=>setForm(p=>({...p,dia_vencimento:e.target.value}))}/></div>
              </div>

              <div style={{fontFamily:'var(--font-display)',fontWeight:700,margin:'18px 0 10px',color:'var(--blue-700)'}}>Usuário Principal</div>
              <div className="form-grid form-grid-3" style={{gap:12}}>
                <div className="form-group"><label>Nome *</label><input value={form.usuario_nome} onChange={e=>setForm(p=>({...p,usuario_nome:e.target.value}))}/></div>
                <div className="form-group"><label>E-mail (login) *</label><input type="email" value={form.usuario_email} onChange={e=>setForm(p=>({...p,usuario_email:e.target.value}))} autoComplete="off"/></div>
                <div className="form-group"><label>Senha *</label>
                  <div style={{display:'flex',gap:6}}>
                    <input value={form.usuario_senha} onChange={e=>setForm(p=>({...p,usuario_senha:e.target.value}))}/>
                    <button className="btn btn-ghost btn-sm" type="button" onClick={gerarSenha}>Gerar</button>
                  </div>
                </div>
              </div>
              <div className="alert alert-info" style={{marginTop:14,fontSize:12}}>Anote a senha e repasse ao cliente. A empresa será criada em ambiente de homologação até o certificado A1 ser enviado.</div>
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-primary" disabled={saving} onClick={criarCliente}>{saving?<span className="spinner"/>:'Criar Cliente'}</button></div>
          </div>
        </div>
      )}

      {/* MODAL DE DETALHES DO CLIENTE */}
      {detModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setDetModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header"><div><div className="modal-title">{det?.cliente?.nome||'Detalhes do Cliente'}</div><div className="modal-sub">Gestão completa do assinante</div></div><button className="modal-close" onClick={()=>setDetModal(false)}>×</button></div>
            <div className="modal-body">
              {detLoading||!det? <div className="empty-state"><span className="spinner"/></div> : (<>
                {/* Métricas de uso */}
                <div className="kpi-grid" style={{marginBottom:18}}>
                  <div className="kpi-card kpi-blue"><div className="kpi-label">Notas (total)</div><div className="kpi-value">{det.metricas.notas_total}</div></div>
                  <div className="kpi-card kpi-green"><div className="kpi-label">Notas no mês</div><div className="kpi-value">{det.metricas.notas_mes}<span style={{fontSize:13,color:'var(--text-3)'}}> / {det.cliente.cota_notas||'∞'}</span></div></div>
                  <div className="kpi-card kpi-violet"><div className="kpi-label">Autorizadas</div><div className="kpi-value">{det.metricas.notas_autorizadas}</div></div>
                </div>

                {/* Edição de plano/assinatura */}
                <div style={{fontFamily:'var(--font-display)',fontWeight:700,marginBottom:10,color:'var(--blue-700)'}}>Assinatura e Dados</div>
                <div className="form-grid form-grid-3" style={{gap:12}}>
                  <div className="form-group"><label>Plano</label><select value={editForm.plano} onChange={e=>setEditForm(p=>({...p,plano:e.target.value}))}><option>Start</option><option>Pro</option><option>Export</option></select></div>
                  <div className="form-group"><label>Valor Mensal (R$)</label><input type="number" step="0.01" value={editForm.valor_mensal} onChange={e=>setEditForm(p=>({...p,valor_mensal:e.target.value}))}/></div>
                  <div className="form-group"><label>Dia Vencimento</label><input type="number" min="1" max="28" value={editForm.dia_vencimento} onChange={e=>setEditForm(p=>({...p,dia_vencimento:e.target.value}))}/></div>
                  <div className="form-group"><label>Nome Fantasia</label><input value={editForm.nome_fantasia} onChange={e=>setEditForm(p=>({...p,nome_fantasia:e.target.value}))}/></div>
                  <div className="form-group col-2"><label>Razão Social</label><input value={editForm.razao_social} onChange={e=>setEditForm(p=>({...p,razao_social:e.target.value}))}/></div>
                  <div className="form-group col-3"><label>Observações (internas)</label><textarea value={editForm.observacoes_admin} onChange={e=>setEditForm(p=>({...p,observacoes_admin:e.target.value}))}/></div>
                </div>
                <button className="btn btn-primary btn-sm" disabled={saving} style={{marginTop:10}} onClick={salvarEdicao}>{saving?<span className="spinner"/>:'Salvar alterações'}</button>

                {/* Usuários do cliente */}
                <div style={{fontFamily:'var(--font-display)',fontWeight:700,margin:'20px 0 10px',color:'var(--blue-700)'}}>Usuários ({det.usuarios.length})</div>
                <div className="table-wrap"><table>
                  <thead><tr><th>Nome</th><th>E-mail</th><th>Papel</th><th>Ativo</th></tr></thead>
                  <tbody>{det.usuarios.map(u=>(
                    <tr key={u.id}><td className="cell-strong">{u.nome||'—'}</td><td className="mono" style={{fontSize:12}}>{u.email}</td><td>{u.papel}</td><td>{u.ativo!==false?'Sim':'Não'}</td></tr>
                  ))}</tbody>
                </table></div>

                {/* Pagamentos */}
                <div style={{fontFamily:'var(--font-display)',fontWeight:700,margin:'20px 0 10px',color:'var(--blue-700)'}}>Pagamentos</div>
                <div style={{background:'var(--bg)',borderRadius:'var(--radius)',padding:14,marginBottom:12}}>
                  <div className="form-grid form-grid-4" style={{gap:10,alignItems:'end'}}>
                    <div className="form-group"><label>Competência</label><input type="month" value={pgForm.competencia} onChange={e=>setPgForm(p=>({...p,competencia:e.target.value}))}/></div>
                    <div className="form-group"><label>Valor</label><input type="number" step="0.01" value={pgForm.valor} onChange={e=>setPgForm(p=>({...p,valor:e.target.value}))}/></div>
                    <div className="form-group"><label>Forma</label><select value={pgForm.forma} onChange={e=>setPgForm(p=>({...p,forma:e.target.value}))}><option value="pix">PIX</option><option value="boleto">Boleto</option><option value="transferencia">Transferência</option><option value="dinheiro">Dinheiro</option></select></div>
                    <button className="btn btn-primary btn-sm" onClick={registrarPagamento}>Registrar pago</button>
                  </div>
                </div>
                {det.pagamentos.length>0 ? (
                  <div className="table-wrap"><table>
                    <thead><tr><th>Competência</th><th>Valor</th><th>Status</th><th>Data</th><th>Forma</th></tr></thead>
                    <tbody>{det.pagamentos.map(p=>(
                      <tr key={p.id}><td className="mono">{p.competencia}</td><td className="mono">{fmtBRL(p.valor)}</td>
                        <td><span className={`badge ${p.status==='pago'?'badge-autorizada':'badge-processando'}`}>{p.status}</span></td>
                        <td className="mono">{p.data_pagamento?fmt.data(p.data_pagamento):'—'}</td><td>{p.forma||'—'}</td></tr>
                    ))}</tbody>
                  </table></div>
                ) : <div style={{color:'var(--text-3)',fontSize:13}}>Nenhum pagamento registrado ainda.</div>}
              </>)}
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setDetModal(false)}>Fechar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// APP — autenticação, carga do tenant, roteamento
// ============================================================
// Dashboard fica solto no topo. Os demais viram grupos (accordion).
const NAV_TOP={id:'dashboard',icon:'◈',label:'Dashboard'};

// Permissões por papel: quais páginas cada papel pode acessar.
// admin = tudo (não filtra). Os demais só veem o que está na lista.
const PERMISSOES={
  operador:['dashboard','emitir','notas','documentos','receber','pagar','caixa','centros','relatorios','destinatarios','produtos','blocos','config','sb-vendas','entrada','sped'],
  contador:['dashboard','relatorios','documentos'],
};
// retorna true se o papel pode ver a página
function podeAcessar(papel,pagina){
  if(papel==='admin'||!papel) return true;       // admin vê tudo
  const lista=PERMISSOES[papel];
  if(!lista) return true;                          // papel desconhecido: não bloqueia
  return lista.includes(pagina);
}

const NAV_GRUPOS=[
  {sec:'FISCAL', icon:'📄', itens:[
    {id:'emitir',icon:'⊕',label:'Emitir NF-e',badge:'novo'},
    {id:'notas',icon:'≡',label:'Notas Emitidas'},
    {id:'entrada',icon:'📥',label:'Notas de Entrada'},
    {id:'sped',icon:'📊',label:'SPED Fiscal'},
    {id:'documentos',icon:'🗎',label:'Documentos Fiscais'},
  ]},
  {sec:'STONE BLOCK', icon:'🧱', pro:true, itens:[
    {id:'sb-vendas',icon:'🛒',label:'Vendas'},
  ]},
  {sec:'FINANCEIRO', icon:'💰', itens:[
    {id:'receber',icon:'↘',label:'Contas a Receber'},
    {id:'pagar',icon:'↗',label:'Contas a Pagar'},
    {id:'caixa',icon:'$',label:'Caixa'},
    {id:'centros',icon:'◎',label:'Centros de Custo'},
    {id:'relatorios',icon:'▤',label:'Relatórios'},
  ]},
  {sec:'CADASTROS', icon:'🗂', itens:[
    {id:'destinatarios',icon:'◰',label:'Clientes'},
    {id:'produtos',icon:'◧',label:'Produtos'},
    {id:'blocos',icon:'⬚',label:'Blocos'},
    {id:'transportadores',icon:'🚚',label:'Transportadores'},
  ]},
  {sec:'SISTEMA', icon:'⚙', itens:[
    {id:'parametros',icon:'⚖',label:'Parâmetros Fiscais'},
    {id:'usuarios',icon:'◍',label:'Usuários'},
    {id:'config',icon:'⚙',label:'Configurações'},
  ]},
];

export default function App(){
  const {toasts,toast}=useToast();
  const [session,setSession]=useState(null);
  const [carregando,setCarregando]=useState(true);
  const [pagina,setPagina]=useState('dashboard');
  const [menuAberto,setMenuAberto]=useState(false);
  // rota /admin (painel da plataforma)
  const rotaAdmin = typeof window!=='undefined' && window.location.pathname.replace(/\/$/,'')==='/admin';
  // qual grupo do accordion está expandido (abre o da tela atual)
  const grupoDaPagina=(pg)=> NAV_GRUPOS.find(g=>g.itens.some(i=>i.id===pg))?.sec || null;
  const [grupoAberto,setGrupoAberto]=useState(grupoDaPagina('dashboard'));
  // ao trocar de página, garante que o grupo dela esteja aberto
  useEffect(()=>{ const g=grupoDaPagina(pagina); if(g) setGrupoAberto(g); },[pagina]);

  // dados do tenant
  const [perfil,setPerfil]=useState(null);
  const [tenant,setTenant]=useState(null);
  const [emitente,setEmitente]=useState(null);
  const [destinatarios,setDestinatarios]=useState([]);
  const [produtos,setProdutos]=useState([]);
  const [blocos,setBlocos]=useState([]);
  const [cfops,setCfops]=useState([]);
  const [naturezas,setNaturezas]=useState([]);
  const [transportadores,setTransportadores]=useState([]);
  const [observacoes,setObservacoes]=useState([]);
  const [notasEntrada,setNotasEntrada]=useState([]);
  const [cfopDepara,setCfopDepara]=useState([]);
  const [produtoDepara,setProdutoDepara]=useState([]);
  const [vendasSB,setVendasSB]=useState([]);
  const [rascunhoVenda,setRascunhoVenda]=useState(null);
  const [notas,setNotas]=useState([]);
  const [centrosCusto,setCentrosCusto]=useState([]);
  const [contasReceber,setContasReceber]=useState([]);
  const [contasPagar,setContasPagar]=useState([]);
  const [caixa,setCaixa]=useState([]);

  // 1. observa sessão de autenticação
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{setSession(data.session);if(!data.session)setCarregando(false);});
    const {data:sub}=supabase.auth.onAuthStateChange((_e,s)=>{setSession(s);if(!s){setCarregando(false);setPerfil(null);setTenant(null);}});
    return ()=>sub.subscription.unsubscribe();
  },[]);

  // 2. ao logar, busca perfil + tenant e carrega os dados
  useEffect(()=>{ if(session) bootstrap(); },[session]);

  async function bootstrap(){
    setCarregando(true);
    const uid=session.user.id;
    // Busca o perfil do usuário. O perfil e o tenant são criados manualmente
    // no Supabase pelo administrador — o app apenas lê.
    const {data:pf}=await supabase.from('perfis').select('*').eq('id',uid).maybeSingle();
    if(!pf){ setPerfil(null); setTenant(null); setCarregando(false); return; }
    setPerfil(pf);
    const {data:tn}=await supabase.from('tenants').select('*').eq('id',pf.tenant_id).maybeSingle();
    setTenant(tn||null);
    if(tn) await carregarDados(pf.tenant_id);
    setCarregando(false);
  }

  async function carregarDados(tid){
    const [em,de,pr,no,cc,cr,cp,cx,bl,cf,nat,tr,ob,ne,dp,pdp,vsb]=await Promise.all([
      supabase.from('emitentes').select('*').eq('tenant_id',tid).maybeSingle(),
      supabase.from('destinatarios').select('*').eq('tenant_id',tid).order('razao_social'),
      supabase.from('produtos').select('*').eq('tenant_id',tid).order('descricao'),
      supabase.from('notas_fiscais').select('*').eq('tenant_id',tid).order('created_at',{ascending:false}),
      supabase.from('centros_custo').select('*').eq('tenant_id',tid).eq('ativo',true).order('nome'),
      supabase.from('contas_receber').select('*').eq('tenant_id',tid).order('data_vencimento'),
      supabase.from('contas_pagar').select('*').eq('tenant_id',tid).order('data_vencimento'),
      supabase.from('caixa_lancamentos').select('*').eq('tenant_id',tid).order('data',{ascending:false}),
      supabase.from('blocos').select('*').eq('tenant_id',tid).order('created_at',{ascending:false}),
      supabase.from('cfops').select('*').eq('tenant_id',tid).eq('ativo',true).order('codigo'),
      supabase.from('naturezas_operacao').select('*').eq('tenant_id',tid).eq('ativo',true).order('descricao'),
      supabase.from('transportadores').select('*').eq('tenant_id',tid).order('nome'),
      supabase.from('observacoes_padrao').select('*').eq('tenant_id',tid).order('titulo'),
      supabase.from('notas_entrada').select('*').eq('tenant_id',tid).order('data_emissao',{ascending:false}),
      supabase.from('cfop_depara').select('*').eq('tenant_id',tid).order('cfop_origem'),
      supabase.from('produto_depara').select('*').eq('tenant_id',tid),
      supabase.from('vendas_stoneblock').select('*').eq('tenant_id',tid).order('created_at',{ascending:false}),
    ]);
    setEmitente(em.data||null);
    setDestinatarios(de.data||[]);
    setProdutos(pr.data||[]);
    setNotas(no.data||[]);
    setCentrosCusto(cc.data||[]);
    setContasReceber(cr.data||[]);
    setContasPagar(cp.data||[]);
    setCaixa(cx.data||[]);
    setBlocos(bl.data||[]);
    setCfops(cf.data||[]);
    setNaturezas(nat.data||[]);
    setTransportadores(tr.data||[]);
    setObservacoes(ob.data||[]);
    setNotasEntrada(ne.data||[]);
    setCfopDepara(dp.data||[]);
    setProdutoDepara(pdp.data||[]);
    setVendasSB(vsb.data||[]);
  }
  const reload=()=>{ if(perfil) carregarDados(perfil.tenant_id); };

  async function sair(){ await supabase.auth.signOut(); }

  if(carregando) return (<><style>{css}</style><div className="center-load"><span className="spinner" style={{width:32,height:32,borderColor:'rgba(37,99,235,0.3)',borderTopColor:'var(--blue-600)'}}/></div></>);
  if(!session) return (<><style>{css}</style><Login toast={toast}/><ToastContainer toasts={toasts}/></>);

  // Rota /admin: painel da plataforma (só super_admin)
  if(rotaAdmin){
    if(perfil && perfil.super_admin){
      return (<><style>{css}</style><AdminPanel session={session} toast={toast} sair={sair}/><ToastContainer toasts={toasts}/></>);
    }
    // logado mas não é super_admin
    if(perfil!==undefined){
      return (<><style>{css}</style>
        <div className="login-wrap"><div className="login-card" style={{maxWidth:440,textAlign:'center'}}>
          <div className="alert alert-warning" style={{textAlign:'left'}}>⚠ Acesso restrito ao administrador da plataforma.</div>
          <button className="btn btn-ghost" onClick={sair} style={{marginTop:14}}>Sair</button>
        </div></div></>);
    }
  }

  // Logado mas sem perfil/tenant vinculado: acesso ainda não liberado pelo admin.
  if(!perfil || !tenant){
    return (<><style>{css}</style>
      <div className="login-wrap">
        <div className="login-card" style={{maxWidth:480,textAlign:'center'}}>
          <div className="login-logo" style={{justifyContent:'center'}}>
            <img src="/logo_full.png" alt="Stone NFe" style={{maxWidth:'80%',height:'auto'}}/>
          </div>
          <div className="alert alert-warning" style={{marginTop:20,textAlign:'left'}}>
            ⚠ Seu acesso ainda não está vinculado a uma empresa. Entre em contato com o administrador para liberar sua conta.
          </div>
          <div style={{display:'flex',gap:10,justifyContent:'center',marginTop:16}}>
            <button className="btn btn-primary" onClick={bootstrap}>↻ Verificar novamente</button>
            <button className="btn btn-ghost" onClick={sair}>Sair</button>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts}/>
    </>);
  }

  const nomeUser=perfil?.nome||session.user.email;
  const ambiente=emitente?.focus_ambiente||'homologacao';
  const titulos={dashboard:'Dashboard',emitir:'Emitir NF-e',notas:'Notas Emitidas',entrada:'Notas de Entrada',sped:'SPED Fiscal',documentos:'Documentos Fiscais','sb-vendas':'Vendas Stone Block',receber:'Contas a Receber',pagar:'Contas a Pagar',caixa:'Caixa',centros:'Centros de Custo',relatorios:'Relatórios',destinatarios:'Clientes',produtos:'Produtos',blocos:'Blocos',transportadores:'Transportadores',usuarios:'Usuários',parametros:'Parâmetros Fiscais',config:'Configurações'};
  function irPara(id){setPagina(id);setMenuAberto(false);}
  function toggleGrupo(sec){setGrupoAberto(g=>g===sec?null:sec);}

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {menuAberto && <div className="sidebar-backdrop" onClick={()=>setMenuAberto(false)}/>}
        <aside className={`sidebar ${menuAberto?'open':''}`}>
          <div className="sidebar-logo">
            <img src="/logo_symbol.png" alt="" className="logo-symbol-img"/>
            <div className="logo-text">Stone <b>NFe</b></div>
          </div>
          <nav className="sidebar-nav">
            {/* Dashboard solto no topo */}
            {podeAcessar(perfil?.papel,NAV_TOP.id) && (
            <button className={`nav-item ${pagina===NAV_TOP.id?'active':''}`} onClick={()=>irPara(NAV_TOP.id)}>
              <span className="nav-icon">{NAV_TOP.icon}</span>{NAV_TOP.label}
            </button>)}

            {/* Grupos accordion (filtrados por papel) */}
            {NAV_GRUPOS.map(g=>{
              // Grupos marcados como pro:true so aparecem nos planos Pro/Export/Completo
              const planoTenant=(tenant?.plano||'Start');
              if(g.pro && !['Pro','Export','Completo'].includes(planoTenant)) return null;
              const itensVisiveis=g.itens.filter(n=>podeAcessar(perfil?.papel,n.id));
              if(itensVisiveis.length===0) return null;   // grupo sem itens some
              const aberto=grupoAberto===g.sec;
              const temAtiva=itensVisiveis.some(i=>i.id===pagina);
              return (
                <div key={g.sec} className="nav-group">
                  <button className={`nav-parent ${temAtiva?'has-active':''}`} onClick={()=>toggleGrupo(g.sec)}>
                    <span className="nav-icon">{g.icon}</span>
                    <span className="nav-parent-label">{g.sec}</span>
                    <span className={`nav-caret ${aberto?'open':''}`}>⌄</span>
                  </button>
                  <div className={`nav-sub ${aberto?'open':''}`}>
                    {itensVisiveis.map(n=>(
                      <button key={n.id} className={`nav-item nav-child ${pagina===n.id?'active':''}`} onClick={()=>irPara(n.id)}>
                        <span className="nav-icon">{n.icon}</span>{n.label}
                        {n.badge&&<span className="nav-badge">{n.badge}</span>}
                      </button>))}
                  </div>
                </div>
              );
            })}
          </nav>
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="avatar">{iniciais(nomeUser)}</div>
              <div><div className="user-name">{nomeUser}</div><div className="user-role">{emitente?.nome_fantasia||emitente?.razao_social||tenant?.nome||'—'}</div></div>
            </div>
            <button className="side-btn side-btn-config" onClick={()=>{setPagina('config');setMenuAberto(false);}}>⚙ Configurações</button>
            <button className="side-btn side-btn-exit" onClick={sair}>⎋ Sair</button>
            <div className="nvx-credit-side">
              <span>desenvolvido por</span>
              <img src="/logo_nvx.png" alt="NVX Technology"/>
            </div>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <button className="menu-toggle" onClick={()=>setMenuAberto(v=>!v)} aria-label="Menu">☰</button>
            <img src="/logo_symbol.png" alt="" className="topbar-logo-img"/>
            <div className="topbar-brand">Stone <b>NFe</b><span className="topbar-versao">PRO</span></div>
            <div className="topbar-spacer"/>
            <span className={`topbar-env ${ambiente}`}>● {ambiente==='homologacao'?'HOMOLOGAÇÃO':'PRODUÇÃO'}</span>
            <div className="topbar-avatar">{iniciais(nomeUser)}</div>
          </div>

          {!podeAcessar(perfil?.papel,pagina) ? (
            <div className="page"><div className="card card-pad" style={{textAlign:'center',padding:'48px 24px'}}>
              <div style={{fontSize:40,marginBottom:12}}>🔒</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:700,marginBottom:6}}>Acesso não permitido</div>
              <div style={{color:'var(--text-2)'}}>Seu perfil não tem acesso a esta área.</div>
              <button className="btn btn-primary" style={{marginTop:16}} onClick={()=>setPagina('dashboard')}>Voltar ao início</button>
            </div></div>
          ) : (<>
          {pagina==='dashboard' && <Dashboard notas={notas} emitente={emitente} tenant={tenant} nomeUser={nomeUser} contasReceber={contasReceber} contasPagar={contasPagar} caixa={caixa} goTo={setPagina}/>}
          {pagina==='emitir' && <EmissaoNFe tenantId={perfil.tenant_id} emitente={emitente} destinatarios={destinatarios} produtos={produtos} blocos={blocos} cfops={cfops} naturezas={naturezas} transportadores={transportadores} observacoes={observacoes} reload={reload} toast={toast} goTo={setPagina} rascunhoVenda={rascunhoVenda} limparRascunho={()=>setRascunhoVenda(null)}/>}
          {pagina==='sb-vendas' && <VendasStoneBlock tenantId={perfil.tenant_id} vendas={vendasSB} reload={reload} toast={toast} goToEmissao={(v)=>{setRascunhoVenda(v);setPagina('emitir');}}/>}
          {pagina==='notas' && <ListaNotas notas={notas} toast={toast} reload={reload} emitente={emitente}/>}
          {pagina==='entrada' && <NotasEntrada tenantId={perfil.tenant_id} notasEntrada={notasEntrada} cfopDepara={cfopDepara} produtos={produtos} produtoDepara={produtoDepara} reload={reload} toast={toast}/>}
          {pagina==='sped' && <SpedFiscal tenantId={perfil.tenant_id} emitente={emitente} produtos={produtos} notasEntrada={notasEntrada} notas={notas} destinatarios={destinatarios} toast={toast}/>}
          {pagina==='documentos' && <DocumentosFiscais notas={notas} emitente={emitente} toast={toast}/>}
          {pagina==='receber' && <ContasReceber tenantId={perfil.tenant_id} contas={contasReceber} destinatarios={destinatarios} centrosCusto={centrosCusto} reload={reload} toast={toast}/>}
          {pagina==='pagar' && <ContasPagar tenantId={perfil.tenant_id} contas={contasPagar} centrosCusto={centrosCusto} reload={reload} toast={toast}/>}
          {pagina==='caixa' && <Caixa tenantId={perfil.tenant_id} lancamentos={caixa} centrosCusto={centrosCusto} reload={reload} toast={toast}/>}
          {pagina==='centros' && <CentrosCusto tenantId={perfil.tenant_id} centros={centrosCusto} contasPagar={contasPagar} caixa={caixa} reload={reload} toast={toast}/>}
          {pagina==='relatorios' && <Relatorios notas={notas} contasReceber={contasReceber} contasPagar={contasPagar} caixa={caixa} centrosCusto={centrosCusto}/>}
          {pagina==='destinatarios' && <Destinatarios tenantId={perfil.tenant_id} destinatarios={destinatarios} reload={reload} toast={toast}/>}
          {pagina==='transportadores' && <Transportadores tenantId={perfil.tenant_id} transportadores={transportadores} reload={reload} toast={toast}/>}
          {pagina==='produtos' && <Produtos tenantId={perfil.tenant_id} produtos={produtos} reload={reload} toast={toast}/>}
          {pagina==='blocos' && <Blocos tenantId={perfil.tenant_id} blocos={blocos} produtos={produtos} reload={reload} toast={toast}/>}
          {pagina==='usuarios' && <Usuarios tenantId={perfil.tenant_id} perfilAtual={perfil} reload={reload} toast={toast}/>}
          {pagina==='parametros' && <ParametrosFiscais tenantId={perfil.tenant_id} cfops={cfops} naturezas={naturezas} observacoes={observacoes} cfopDepara={cfopDepara} emitente={emitente} reload={reload} toast={toast}/>}
          {pagina==='config' && <Configuracoes tenantId={perfil.tenant_id} emitente={emitente} tenant={tenant} reload={reload} toast={toast}/>}
          </>)}
        </main>
      </div>
      <ToastContainer toasts={toasts}/>
    </>
  );
}
