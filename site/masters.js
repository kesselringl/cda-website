/* CDA Masters – Statistik-Ansicht der Homepage (Simulation). Quelle: competition/part_script.html */
(function(){var host=document.getElementById('masters-app');if(!host||host.shadowRoot)return;
var root=host.attachShadow({mode:'open'});root.innerHTML='<style>'+"\n/* Layout: Kopfleiste mit f\u00fcnf Ansichten (Turnierleitung, Board 1, Board 2, Live, Saison). Board-Ansicht = Anzeigetafel f\u00fcr einen PC mit Tastatur. */\n:host{display:block;color:var(--ink);font-family:var(--f-body);font-size:15px;line-height:1.5;\n  --panel:var(--surface);--panel-2:var(--chip);--green-ink:var(--green);--gold:var(--tbd)}\n*{box-sizing:border-box}\nbutton{font:inherit;color:inherit;cursor:pointer}\n:focus-visible{outline:3px solid var(--green);outline-offset:2px}\n.num{font-variant-numeric:tabular-nums}\n.tm{display:inline-block;font-family:var(--f-body);font-size:.62rem;font-weight:700;letter-spacing:.04em;line-height:1;padding:2px 4px;border-radius:3px;border:1px solid var(--line);color:var(--muted);vertical-align:2px;margin-left:2px}\n.wrap{max-width:1280px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}\n\n/* Kopf */\n.top{position:sticky;top:env(safe-area-inset-top,0px);z-index:9;background:var(--panel);border-bottom:1px solid var(--line)}\n.top .wrap{display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding-block:10px}\n.brand{display:flex;align-items:baseline;gap:10px;margin-right:auto}\n.brand b{font-family:var(--f-display);font-weight:900;font-size:1.5rem;text-transform:uppercase;letter-spacing:.02em;line-height:1}\n.brand span{font-size:.75rem;color:var(--muted);letter-spacing:.1em;text-transform:uppercase}\n.tabs{display:flex;gap:4px;flex-wrap:wrap}\n.tabs button{background:none;border:1px solid var(--line);border-radius:var(--radius);padding:7px 12px;font-weight:600;font-size:.88rem;color:var(--muted)}\n.tabs button[aria-selected=\"true\"]{background:var(--green);border-color:var(--green);color:#fff}\n.demo-note{font-size:.78rem;color:var(--muted);padding-block:8px;border-bottom:1px solid var(--line)}\n.demo-note b{color:var(--gold);font-weight:600}\n\nmain{padding-block:24px 56px}\nh2{font-family:var(--f-display);font-weight:800;text-transform:uppercase;font-size:1.6rem;line-height:1;margin:0 0 12px;letter-spacing:.01em;text-wrap:balance}\nh3{font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:0 0 10px;font-weight:700}\n.grid{display:grid;gap:16px}\n.g2{grid-template-columns:repeat(auto-fit,minmax(320px,1fr))}\n.g3{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}\n.panel{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:16px;min-width:0}\n.muted{color:var(--muted)}\n.btn{background:var(--panel-2);border:1px solid var(--line);border-radius:var(--radius);padding:9px 14px;font-weight:600}\n.btn:hover{border-color:var(--muted)}\n.btn.primary{background:#0b7d27;border-color:#0b7d27;color:#fff}\n.btn.primary:hover{filter:brightness(1.1)}\n.btn.small{padding:6px 10px;font-size:.85rem}\n.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}\n\n/* Check-in */\n.players{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:6px;margin-top:4px}\n.chip{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--line);border-radius:var(--radius);background:var(--panel-2);text-align:left;min-width:0}\n.chip .box{width:18px;height:18px;border-radius:4px;border:2px solid var(--muted);flex:none;display:grid;place-items:center;font-size:12px;line-height:1}\n.chip[aria-pressed=\"true\"]{border-color:var(--green)}\n.chip[aria-pressed=\"true\"] .box{background:var(--green);border-color:var(--green);color:#fff}\n.chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.chip small{margin-left:auto;color:var(--gold);font-size:.7rem;letter-spacing:.06em;text-transform:uppercase}\n.add{display:flex;gap:8px;margin-top:12px}\n.add input{flex:1;min-width:0;background:var(--bg);border:1px solid var(--line);border-radius:var(--radius);padding:9px 12px;color:var(--ink);font:inherit}\n.plan dl{display:grid;grid-template-columns:auto 1fr;gap:6px 16px;margin:0 0 16px}\n.plan dt{color:var(--muted);font-size:.85rem}\n.plan dd{margin:0;font-weight:600}\n.big-n{font-family:var(--f-display);font-weight:900;font-size:3.4rem;line-height:.9}\n.warn{border-left:3px solid var(--gold);padding:6px 10px;background:color-mix(in srgb,var(--gold) 10%,transparent);font-size:.88rem;margin:0 0 14px;border-radius:3px}\n\n/* Tabellen */\n.tbl-wrap{overflow-x:auto}\ntable{border-collapse:collapse;width:100%;font-size:.9rem}\nth{font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700;text-align:right;padding:4px 6px;border-bottom:1px solid var(--line)}\ntd{padding:6px;border-bottom:1px solid var(--line);text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}\nth:nth-child(2),td:nth-child(2){text-align:left;width:100%}\nth:first-child,td:first-child{text-align:left;color:var(--muted);width:1%}\ntr.q td:nth-child(2){font-weight:700}\ntr.q td:first-child{color:var(--green-ink)}\n\n/* Match-Listen */\n.mlist{list-style:none;margin:0;padding:0;display:grid;gap:6px}\n.mitem{display:grid;grid-template-columns:auto 1fr auto 1fr;gap:10px;align-items:center;padding:8px 10px;background:var(--panel-2);border-radius:var(--radius);font-size:.9rem}\n.mitem .tag{font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);width:72px}\n.mitem .a{text-align:right;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.mitem .b{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.mitem .s{font-family:var(--f-display);font-weight:800;font-size:1.15rem;min-width:42px;text-align:center}\n.mitem .w{font-weight:700}\n.mitem.tbd{color:var(--muted)}\n\n/* Boards in der \u00dcbersicht */\n.bcard{display:grid;gap:8px}\n.bcard .bhead{display:flex;justify-content:space-between;align-items:center}\n.bcard .bname{font-family:var(--f-display);font-weight:800;font-size:1.2rem;text-transform:uppercase}\n.pill{font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;font-weight:700;padding:3px 8px;border-radius:99px;background:var(--panel-2);color:var(--muted)}\n.pill.live{background:color-mix(in srgb,var(--red) 22%,transparent);color:#ff8a92}\n.pill.live::before{content:\"\";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--red);margin-right:6px;vertical-align:1px;animation:blink 1.4s infinite}\n.pill.free{background:color-mix(in srgb,var(--green) 18%,transparent);color:var(--green-ink)}\n@keyframes blink{50%{opacity:.25}}\n.mini{display:grid;grid-template-columns:1fr auto auto auto;gap:4px 12px;align-items:baseline}\n.mini .n{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.mini .n.on{font-weight:700}\n.mini .n.on::before{content:\"\u25b8 \";color:var(--green-ink)}\n.mini .av{font-size:.82rem;color:var(--muted)}\n.mini .l{font-family:var(--f-display);font-weight:800;font-size:1.2rem;color:var(--muted)}\n.mini .r{font-family:var(--f-display);font-weight:800;font-size:1.6rem;min-width:56px;text-align:right}\n\n.progress{height:6px;background:var(--panel-2);border-radius:99px;overflow:hidden;margin-top:8px}\n.progress i{display:block;height:100%;background:var(--green)}\n\n/* Highlights */\n.hl{list-style:none;margin:0;padding:0;display:grid;gap:6px}\n.hl li{display:flex;gap:10px;align-items:baseline;font-size:.9rem}\n.hl b{font-family:var(--f-display);font-weight:800;font-size:1.2rem;color:var(--gold);min-width:54px}\n\n/* Scorer */\n.scorer{display:grid;gap:16px}\n.sb-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}\n.sb-head .stage{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:700}\n.wsmall{font-size:.85rem;color:var(--muted);margin-left:auto;margin-right:16px}\n.call{display:grid;gap:20px;justify-items:center;text-align:center;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:32px 20px}\n.call .stage{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:700}\n.callh{font-size:1.2rem;color:var(--green-ink);margin:0}\n.vs{display:flex;flex-direction:column;align-items:center;gap:6px;font-family:var(--f-display);font-weight:900;font-size:clamp(2.2rem,6vw,4rem);line-height:1;text-transform:uppercase}\n.vs i{font-family:var(--f-body);font-style:normal;font-size:1rem;color:var(--muted);text-transform:none;font-weight:500}\n.vs .tm{font-size:.9rem;vertical-align:.6em}\n.call .writer{width:100%;max-width:720px;justify-content:center}\n.writer{display:flex;align-items:center;gap:16px;flex-wrap:wrap;background:var(--gold);color:#1a1405;border-radius:var(--radius);padding:10px 20px}\n.writer .wl{font-size:.8rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase}\n.writer .wn{font-family:var(--f-display);font-weight:900;font-size:clamp(1.8rem,4vw,2.6rem);line-height:1;text-transform:uppercase;min-width:0;overflow-wrap:anywhere}\n.writer .tm{color:#1a1405;border-color:rgba(26,20,5,.4);font-size:.9rem;vertical-align:.4em}\n.writer.none{background:color-mix(in srgb,var(--red) 30%,var(--panel));color:var(--ink)}\n.writer.none .wl{color:var(--ink)}\n.sb-head .fmt{font-size:.85rem;color:var(--muted)}\n.duel{display:grid;grid-template-columns:1fr 1fr;gap:12px}\n.side{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:18px 20px;display:grid;gap:6px;position:relative;min-width:0}\n.side.on{border-color:var(--green);box-shadow:inset 0 4px 0 var(--green)}\n.side .pn{font-weight:700;font-size:1.15rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:64px}\n.side .legs{position:absolute;top:14px;right:18px;font-family:var(--f-display);font-weight:900;font-size:2.4rem;line-height:1}\n.side .legs small{font-family:var(--f-body);font-size:.66rem;letter-spacing:.1em;color:var(--muted);font-weight:700;display:block;text-align:right}\n.side .rest{font-family:var(--f-display);font-weight:900;font-size:clamp(4.5rem,13vw,9rem);line-height:.9;letter-spacing:-.01em}\n.side.on .rest{color:#fff}\n.side:not(.on) .rest{color:var(--muted)}\n.side .co{min-height:1.6em;font-weight:700;color:var(--gold);letter-spacing:.04em}\n.side .st{display:flex;gap:16px;flex-wrap:wrap;font-size:.82rem;color:var(--muted)}\n.side .st b{color:var(--ink);font-weight:600}\n.visits{display:flex;gap:6px;flex-wrap:wrap;min-height:28px}\n.visits span{font-variant-numeric:tabular-nums;font-size:.85rem;background:var(--panel-2);border-radius:4px;padding:2px 7px;color:var(--muted)}\n.visits span.hi{color:var(--gold);font-weight:700}\n.visits span.bust{color:#ff8a92;text-decoration:line-through}\n\n.entry{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,340px);gap:16px;align-items:start}\n.inbox{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:16px 20px;display:grid;gap:10px}\n.inbox .who{font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700}\n.inbox .val{font-family:var(--f-display);font-weight:900;font-size:4rem;line-height:1;min-height:1em;border-bottom:2px solid var(--green);padding-bottom:4px}\n.inbox .val .cursor{display:inline-block;width:.08em;height:.8em;background:var(--green);vertical-align:-.05em;animation:blink 1s infinite}\n.inbox .msg{min-height:1.5em;font-size:.9rem}\n.inbox .msg.err{color:#ff8a92}\n.keys{font-size:.8rem;color:var(--muted);display:flex;gap:6px 14px;flex-wrap:wrap}\nkbd{font-family:var(--f-body);font-size:.75rem;border:1px solid var(--line);border-bottom-width:2px;border-radius:4px;padding:0 5px;color:var(--ink);background:var(--panel-2)}\n.pad{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}\n.pad button{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:12px 0;font-family:var(--f-display);font-weight:800;font-size:1.5rem}\n.pad button:hover{border-color:var(--muted)}\n.pad button.ok{background:var(--green);border-color:var(--green);color:#fff;font-family:var(--f-body);font-size:1rem}\n.pad button.rs{grid-column:span 2;background:var(--panel-2);border-color:var(--gold);color:var(--gold);font-family:var(--f-body);font-size:1rem;font-weight:700}\n.pad button.fn{font-family:var(--f-body);font-size:.9rem;font-weight:600;color:var(--muted)}\n.quick{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:6px}\n.quick button{background:var(--panel-2);border:1px solid var(--line);border-radius:var(--radius);padding:8px 0;font-weight:700;font-variant-numeric:tabular-nums}\n.ask{background:color-mix(in srgb,var(--gold) 12%,var(--panel));border:1px solid var(--gold);border-radius:var(--radius);padding:16px 20px;display:grid;gap:12px}\n.ask p{margin:0;font-weight:600}\n.ask .row button{min-width:90px}\n.over{background:color-mix(in srgb,var(--green) 14%,var(--panel));border:1px solid var(--green);border-radius:var(--radius);padding:20px;display:grid;gap:12px;text-align:center}\n.over .res{font-family:var(--f-display);font-weight:900;font-size:2.6rem;line-height:1;text-transform:uppercase}\n.idle{text-align:center;padding:48px 16px;display:grid;gap:10px;justify-items:center}\n.idle .big-n{color:var(--muted)}\n\n@media (max-width:760px){\n  .entry{grid-template-columns:1fr}\n  .duel{gap:8px}\n  .side{padding:14px}\n  .side .legs{font-size:1.8rem;top:10px;right:12px}\n  .side .pn{padding-right:40px;font-size:1rem}\n  .mitem{grid-template-columns:1fr auto 1fr}\n  .mitem .tag{grid-column:1/-1;width:auto}\n}\n@media (prefers-reduced-motion:reduce){*{animation:none!important}}\n/* Eingabe x01: Schnellwerte links und rechts, Ziffernblock in der Mitte */\n.entry2{display:grid;grid-template-columns:minmax(0,320px) minmax(0,420px);gap:14px;align-items:stretch;justify-content:center}\n.inbox2{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:12px 14px;display:grid;gap:8px;min-width:0}\n.inbox2 .who{font-size:.74rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700;text-align:center}\n.inbox2 .val{font-family:var(--f-display);font-weight:900;font-size:2.8rem;line-height:1;min-height:1em;border-bottom:2px solid var(--green);padding-bottom:2px;text-align:center}\n.inbox2 .val .cursor{display:inline-block;width:.08em;height:.8em;background:var(--green);vertical-align:-.05em;animation:blink 1s infinite}\n.inbox2 .msg{min-height:1.3em;font-size:.85rem;text-align:center}\n.inbox2 .msg.err{color:#ff8a92}\n.inbox2 .pad{gap:5px}\n.inbox2 .pad button{padding:7px 0;font-size:1.3rem}\n.inbox2 .pad button.ok,.inbox2 .pad button.rs,.inbox2 .pad button.fn{font-size:.92rem}\n.quick2{display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:8px}\n.quick2 button.q180{grid-column:1/-1}\n.quick2 button{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);font-family:var(--f-display);font-weight:800;font-size:clamp(1.3rem,2.4vw,2rem);font-variant-numeric:tabular-nums;min-height:44px}\n.quick2 button:hover{border-color:var(--muted);background:var(--panel-2)}\n.quick2 button.q180{border-color:var(--gold);color:var(--gold)}\n.legend{display:flex;flex-wrap:wrap;gap:4px 14px;justify-content:center;font-size:.72rem;color:var(--muted);opacity:.75}\n.legend kbd{font-size:.68rem}\n.linkbtn{background:none;border:0;padding:0;color:var(--muted);text-decoration:underline;font-size:.72rem}\n.side{padding:20px 24px}\n.side .legs{font-size:clamp(3rem,6vw,5rem)!important;top:16px!important;right:22px!important;text-align:center;line-height:.9}\n.side .legs small{font-size:.8rem!important;text-align:center!important;margin-top:4px;letter-spacing:.14em}\n.side .pn{padding-right:130px!important}\n.side .pn{font-size:clamp(1.3rem,2.4vw,1.9rem)!important;padding-right:90px!important}\n.side .st{font-size:clamp(1rem,1.6vw,1.25rem)!important;gap:8px 28px!important}\n.side .st b{font-family:var(--f-display);font-weight:800;font-size:1.35em;margin-right:4px}\n.side .visits span{font-size:1.05rem!important;padding:3px 9px!important}\n.side .co{font-size:1.15rem}\n.thrower{font-size:1rem}\n.side .rest{font-size:clamp(5rem,16vw,13rem)!important}\n.scorer{gap:12px}\n@media (max-width:760px){.side .legs{font-size:2.4rem!important;top:10px!important;right:12px!important}.side .legs small{font-size:.6rem!important}.entry2{grid-template-columns:1fr}.inbox2{order:-1}.quick2{grid-template-columns:repeat(5,1fr)}.side .pn{padding-right:64px!important;font-size:1.05rem!important}.side .st{font-size:.85rem!important;gap:4px 12px!important}.quick2 button{font-size:1.15rem}.side .rest{font-size:clamp(3.6rem,17vw,6rem)!important}}\n/* Modi */\n.bysel{background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:var(--radius);padding:9px 10px;font:inherit;min-width:0;max-width:45%}\n.recruit{list-style:none;margin:0;padding:0;display:grid;gap:8px}\n.recruit li{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;background:var(--panel-2);border-radius:var(--radius);padding:10px 12px}\n.recruit .rn{font-family:var(--f-display);font-weight:900;font-size:1.6rem;color:var(--gold);min-width:32px;text-align:center}\n.recruit .gs{font-size:.8rem;color:var(--muted)}\n.recruit .gv{font-size:.8rem;color:var(--muted);text-align:right;white-space:nowrap}\n.modes{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px}\n.mode{display:grid;gap:4px;text-align:left;padding:12px 14px;border:1px solid var(--line);border-radius:var(--radius);background:var(--panel-2);position:relative}\n.mode b{font-family:var(--f-display);font-weight:800;font-size:1.25rem;text-transform:uppercase;line-height:1}\n.mode .ms{font-size:.78rem;color:var(--gold);font-weight:600}\n.mode p{margin:0;font-size:.82rem;color:var(--muted);line-height:1.4}\n.mode[aria-pressed=\"true\"]{border-color:var(--green);box-shadow:inset 0 0 0 1px var(--green)}\n.mode .flag{justify-self:start;margin-bottom:4px;font-size:.6rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:2px 6px;border-radius:99px}\n.flag.ms-on{background:color-mix(in srgb,var(--green) 22%,transparent);color:var(--green-ink)}\n.flag.ms-off{background:color-mix(in srgb,var(--gold) 18%,transparent);color:var(--gold)}\n.hs{margin-left:auto;font-size:.7rem;font-weight:700;color:var(--gold);font-variant-numeric:tabular-nums;flex:none}\n.modebar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 16px;border-radius:var(--radius);background:var(--panel);border:1px solid var(--line)}\n.modebar b{font-family:var(--f-display);font-weight:900;font-size:1.4rem;text-transform:uppercase;line-height:1}\n.modebar span{color:var(--muted);font-size:.88rem}\n.modebar .flag{font-size:.64rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:3px 8px;border-radius:99px;margin-left:auto}\n\n/* Scorer-Zus\u00e4tze */\n.thrower{font-size:.85rem;color:var(--muted)}\n.thrower b{color:var(--ink)}\n.side.on .thrower b{color:var(--gold)}\n.badge-di{display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#ff8a92;border:1px solid currentColor;border-radius:4px;padding:2px 6px}\n.startval{font-size:.75rem;color:var(--muted)}\n\n/* Cricket */\n.cboard{display:grid;grid-template-columns:1fr auto 1fr;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden}\n.chead{padding:14px 18px;display:grid;gap:4px;min-width:0}\n.chead.r{text-align:right}\n.chead.on{box-shadow:inset 0 4px 0 var(--green)}\n.chead .pn{font-weight:700;font-size:1.1rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.chead .pts{font-family:var(--f-display);font-weight:900;font-size:clamp(3rem,8vw,5.5rem);line-height:.9}\n.chead:not(.on) .pts{color:var(--muted)}\n.chead .lg{font-size:.8rem;color:var(--muted)}\n.cmid{display:grid;align-content:start;border-inline:1px solid var(--line)}\n.crow{display:grid;grid-template-columns:64px 72px 64px;align-items:center;border-top:1px solid var(--line);height:46px}\n.crow .no{font-family:var(--f-display);font-weight:900;font-size:1.6rem;text-align:center}\n.crow.closed .no{color:var(--muted);text-decoration:line-through}\n.mk{display:grid;place-items:center}\n.mk svg{width:30px;height:30px}\n.crow .mk.done svg{color:var(--green-ink)}\n.ctop{height:auto;padding:8px 0;font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700}\n.cpad{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}\n.cpad .no{font-family:var(--f-display);font-weight:900;font-size:1.3rem;display:grid;place-items:center;color:var(--muted)}\n.cpad button{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:10px 0;font-weight:700}\n.cpad button:hover{border-color:var(--muted)}\n.cpad button.t{color:var(--gold)}\n.cpad button:disabled{opacity:.3;cursor:not-allowed}\n.cvis{display:flex;gap:8px;min-height:44px;align-items:center;flex-wrap:wrap}\n.cvis span{font-family:var(--f-display);font-weight:800;font-size:1.5rem;background:var(--panel-2);border-radius:4px;padding:2px 12px;min-width:64px;text-align:center}\n.cvis span.empty{color:var(--line);font-family:var(--f-body);font-size:1rem}\n\n/* Saison */\n.rank td:nth-child(2){font-weight:600}\n.cut td{border-bottom:2px dashed var(--gold)}\n.form{display:inline-flex;gap:3px;vertical-align:middle}\n.form i{width:16px;height:16px;border-radius:3px;display:grid;place-items:center;font-style:normal;font-size:.6rem;font-weight:700;background:var(--panel-2);color:var(--muted)}\n.form i.f1{background:var(--gold);color:#1a1405}\n.form i.f4{background:color-mix(in srgb,var(--green) 45%,transparent);color:#fff}\n.form i.f0{background:none;border:1px dashed var(--line)}\n.pts{font-family:var(--f-display);font-weight:800;font-size:1.1rem}\n.records{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}\n.rec{background:var(--panel-2);border-radius:var(--radius);padding:12px 14px;display:grid;gap:2px;min-width:0}\n.rec .rv{font-family:var(--f-display);font-weight:900;font-size:2.2rem;line-height:1;color:var(--gold)}\n.rec .rl{font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:700}\n.rec .rw{font-size:.88rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.evlist{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}\n.evc{background:var(--panel-2);border-radius:var(--radius);padding:12px 14px;display:grid;gap:4px;border-left:3px solid var(--line);min-width:0}\n.evc.ms{border-left-color:var(--green)}\n.evc.sp{border-left-color:var(--gold)}\n.evc .ed{font-size:.75rem;color:var(--muted);font-variant-numeric:tabular-nums}\n.evc .en{font-family:var(--f-display);font-weight:800;font-size:1.15rem;text-transform:uppercase;line-height:1.05}\n.evc .ew{font-size:.9rem}\n.evc .ew b{color:var(--gold)}\nth.sort{cursor:pointer;user-select:none}\nth.sort:hover{color:var(--ink)}\nth.sorted{color:var(--green-ink)}\n.duel-pick{display:flex;gap:10px;flex-wrap:wrap;align-items:center}\n.duel-pick select{background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:var(--radius);padding:8px 10px;font:inherit;min-width:0;max-width:100%}\n.h2h{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin-top:16px;text-align:center}\n.h2h .hn{font-weight:700;overflow-wrap:anywhere}\n.h2h .hs2{font-family:var(--f-display);font-weight:900;font-size:3.4rem;line-height:1}\n.h2h .hd{font-size:.82rem;color:var(--muted)}\n.bars{display:grid;gap:6px;margin-top:14px}\n.bar{display:grid;grid-template-columns:1fr 90px 1fr;gap:10px;align-items:center;font-size:.85rem}\n.bar .l,.bar .r{height:8px;background:var(--panel-2);border-radius:99px;overflow:hidden;display:flex}\n.bar .l{justify-content:flex-end}\n.bar .l i{background:var(--green)}\n.bar .r i{background:var(--gold)}\n.bar .c{text-align:center;color:var(--muted);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase}\n.bar .v{display:flex;justify-content:space-between;grid-column:1/-1;font-variant-numeric:tabular-nums;margin-top:-4px;font-size:.82rem}\n@media (max-width:760px){\n  .crow{grid-template-columns:44px 52px 44px;height:40px}\n  .crow .no{font-size:1.3rem}\n  .mk svg{width:24px;height:24px}\n  .chead{padding:10px 12px}\n}\n.gev.gnone{cursor:default}\n.sync{font-size:.78rem;font-weight:700;padding:4px 10px;border-radius:99px;white-space:nowrap}\n.sync.ok{background:color-mix(in srgb,var(--green) 18%,transparent);color:var(--green-ink)}\n.sync.busy{background:color-mix(in srgb,var(--gold) 18%,transparent);color:var(--gold)}\n.sync.err{background:color-mix(in srgb,var(--red) 18%,transparent);color:var(--red);white-space:normal}\n.btn.on{background:var(--green);border-color:var(--green);color:#fff}\n.sbp .sbgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:20px}\n@media (max-width:760px){.sbp .sbgrid{grid-template-columns:1fr}}\n.sblist{list-style:none;margin:0 0 12px;padding:0;display:flex;flex-wrap:wrap;gap:6px}\n.sblist li{background:var(--panel-2);border-radius:99px;padding:4px 10px;font-size:.88rem}\n.wa h3{margin:0 0 8px}\n.watxt{white-space:pre-wrap;font:inherit;font-size:.9rem;background:var(--panel-2);border-left:3px solid #25D366;border-radius:var(--radius);padding:12px;margin:0 0 10px}\n.legbox{border-top:1px solid var(--line);margin-top:14px;padding-top:14px;display:grid;gap:10px;margin-bottom:14px}\n.legbox h3{margin:0}\n.legseg{display:flex;flex-wrap:wrap;gap:6px}\n.legseg .btn.on{background:var(--green);border-color:var(--green);color:#fff}\n.legt{display:flex;align-items:center;gap:8px;font-size:.88rem;color:var(--muted)}\n.legt select{font:inherit;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:var(--radius);padding:6px 8px}\n.legrows{list-style:none;margin:0;padding:0;display:grid;gap:4px}\n.legrows li{display:flex;justify-content:space-between;align-items:center;gap:10px;background:var(--panel-2);border-radius:var(--radius);padding:6px 6px 6px 12px;border-left:3px solid var(--line)}\n.legrows li.cut{border-left-color:var(--gold)}\n.legrows li.cut b{color:var(--gold)}\n.lsw{display:inline-flex;align-items:center;gap:6px}\n.lsw b{min-width:84px;text-align:center;font-variant-numeric:tabular-nums}\n.lsw button{width:30px;height:30px;border-radius:var(--radius);border:1px solid var(--line);background:var(--panel);font-weight:800;font-size:1.05rem;color:var(--ink)}\n.lsw button:disabled{opacity:.35;cursor:default}\n.warn-t{color:var(--red);font-weight:600}\n.lbh{display:flex;justify-content:space-between;align-items:center;gap:8px}\n.lb{position:relative}\n.inf summary{list-style:none;cursor:pointer;width:20px;height:20px;border-radius:50%;border:1.5px solid var(--muted);color:var(--muted);font:700 .72rem/17px var(--f-body);text-align:center;font-style:italic;user-select:none}\n.inf summary::-webkit-details-marker{display:none}\n.inf summary:hover,.inf[open] summary{border-color:var(--green);color:var(--green-ink)}\n.inf p{position:absolute;left:8px;right:8px;top:38px;z-index:3;margin:0;background:var(--panel);border:1px solid var(--line);border-left:3px solid var(--green);border-radius:var(--radius);padding:10px 12px;font-size:.84rem;line-height:1.45;color:var(--ink);box-shadow:0 8px 24px rgba(0,0,0,.25)}\n.rank2 td{vertical-align:middle;padding-block:8px}\n.rank2 .rk{display:inline-grid;place-items:center;min-width:26px;height:26px;border-radius:50%;font-weight:700;font-variant-numeric:tabular-nums}\n.rank2 tr.t1 .rk{background:var(--gold);color:#1a1300}\n.rank2 tr.t2 .rk{background:#b8c0ba;color:#141a16}\n.rank2 tr.t3 .rk{background:#b07a4a;color:#fff}\n.rank2 tr.t1 td,.rank2 tr.t2 td,.rank2 tr.t3 td{background:color-mix(in srgb,var(--gold) 7%,transparent)}\n.rank2 tr.t1 td:nth-child(2){font-size:1.05rem}\n.ptc{display:inline-grid;gap:4px;justify-items:end;min-width:110px}\n.ptc b{font-family:var(--f-display);font-weight:800;font-size:1.25rem;line-height:1}\n.pb{display:block;width:110px;height:5px;border-radius:99px;background:var(--line);overflow:hidden}\n.pb i{display:block;height:100%;background:var(--green);border-radius:99px}\n.abc{display:inline-flex;align-items:center;gap:8px}\n.abc b{min-width:18px;font-variant-numeric:tabular-nums}\n.pips{display:inline-grid;grid-template-columns:repeat(16,5px);gap:2px}\n.pips i{height:12px;border-radius:1px;background:var(--line)}\n.pips i.on{background:var(--green)}\n.pips i.need{background:transparent;box-shadow:inset 0 0 0 1px var(--gold)}\n.qchip.out{background:color-mix(in srgb,var(--red) 15%,transparent);color:var(--red)}\n.rank2 td.mon{color:var(--gold);font-weight:600}\n.rank2 tr.cutrow td{padding:0;border-bottom:0;text-align:center;color:var(--red)}\n.rank2 tr.cutrow span{display:block;border-top:2px dashed var(--red);padding:4px 0 6px;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase}\n/* ===== Spielbetrieb: Auswahl, Anmeldung, Zuschauer ===== */\n.demo-note a{color:var(--green-ink);font-weight:600}\n.gate{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:20px;align-items:start;padding-top:8px}\n.gcard h3{margin-bottom:12px}\n.gev{all:unset;box-sizing:border-box;cursor:pointer;display:grid;gap:6px;width:100%;padding:18px;border-radius:var(--radius);background:var(--panel-2);border:1px solid var(--line);transition:border-color .15s}\n.gev:hover,.gev:focus-visible{border-color:var(--green)}\n.gev b{font-family:var(--f-display);font-weight:900;font-size:2.2rem;line-height:1;text-transform:uppercase}\n.gev .muted{font-size:.88rem}\n.gtop{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}\n.gopen{font-weight:700;color:var(--green-ink);margin-top:4px}\n.gev .progress{display:block;height:6px;border-radius:99px;background:var(--line);overflow:hidden}\n.gev .progress i{display:block;height:100%;background:var(--green)}\n.gst{display:inline-flex;align-items:center;gap:7px;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}\n.gst.live{color:var(--red)}\n.gst.live i{width:9px;height:9px;border-radius:50%;background:var(--red);animation:pulse 1.4s infinite}\n@keyframes pulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--red) 60%,transparent)}70%{box-shadow:0 0 0 8px transparent}100%{box-shadow:0 0 0 0 transparent}}\n.gnext{list-style:none;margin:0;padding:0;display:grid;gap:6px}\n.gnext li{display:grid;grid-template-columns:96px 1fr;gap:2px 10px;align-items:baseline;padding:8px 10px;border-radius:var(--radius);background:var(--panel-2);border-left:3px solid var(--line)}\n.gnext li.ms{border-left-color:var(--gold)}\n.gnext li span{font-size:.85rem;color:var(--muted)}\n.gnext li i{grid-column:2;font-style:normal;font-size:.78rem;color:var(--gold)}\n.glog{display:grid;gap:8px}\n.glog label{font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}\n.glog select,.glog input{font:inherit;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:var(--radius);padding:10px 12px;width:100%;min-width:0}\n.glog .btn{margin-top:6px;justify-self:start}\n.gerr{margin:0;color:var(--red);font-weight:600;font-size:.9rem}\n.cap.demo{border-left:3px solid var(--gold);padding-left:10px}\n.mebox{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;background:var(--panel);border:1px solid var(--line);border-left:3px solid var(--green);border-radius:var(--radius);padding:10px 14px}\n.mebox select{font:inherit;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:var(--radius);padding:6px 10px;max-width:100%}\n.mebox .mnow{color:var(--green-ink)}\n.mebox .mwr{color:var(--gold)}\n/* ===== Neu: Einstellungen, Siegerehrung, Profil, Recap, Saison ===== */\n.setup{display:grid;gap:12px}\n.vpre{display:flex;gap:8px;flex-wrap:wrap}\n.vpre button{background:var(--panel-2);border:1px solid var(--line);border-radius:var(--radius);padding:8px 12px;font-weight:600;text-align:left;display:grid;gap:2px}\n.vpre button small{font-size:.74rem;color:var(--muted);font-weight:500}\n.vpre button[aria-pressed=\"true\"]{border-color:var(--green);box-shadow:inset 0 0 0 1px var(--green)}\n.bcount{display:flex;align-items:center;gap:10px}\n.bcount button{width:36px;height:36px;border-radius:var(--radius);border:1px solid var(--line);background:var(--panel-2);font-weight:800;font-size:1.2rem}\n.bcount b{font-family:var(--f-display);font-weight:900;font-size:2rem;min-width:28px;text-align:center}\n.btypes{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}\n.btypes button{background:var(--panel-2);border:1px solid var(--line);border-radius:var(--radius);padding:8px 10px;display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:.88rem}\n.btypes button span{font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:2px 7px;border-radius:99px}\n.btypes .t-pc{background:color-mix(in srgb,var(--green) 20%,transparent);color:var(--green-ink)}\n.btypes .t-tablet{background:color-mix(in srgb,var(--gold) 20%,transparent);color:var(--gold)}\n.money{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 14px}\n.money div{background:var(--panel-2);border-radius:var(--radius);padding:8px 10px}\n.money b{display:block;font-family:var(--f-display);font-weight:900;font-size:1.5rem;line-height:1;color:var(--gold)}\n.money span{font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700}\n.devtag{font-size:.64rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:2px 7px;border-radius:99px;margin-left:8px;vertical-align:2px}\n.selall{display:flex;gap:6px;margin:-4px 0 8px}\n\n/* Tablet-Scorer */\n.scorer.tablet .legend{display:none}\n.scorer.tablet .entry2{grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);max-width:900px;margin:0 auto;width:100%}\n.scorer.tablet .inbox2 .pad button{padding:16px 0;font-size:1.9rem}\n.scorer.tablet .inbox2 .pad button.ok,.scorer.tablet .inbox2 .pad button.rs,.scorer.tablet .inbox2 .pad button.fn{font-size:1.1rem}\n.scorer.tablet .quick2 button{font-size:2rem}\n\n/* Siegerehrung */\n.cer{display:grid;gap:22px;justify-items:center;text-align:center;padding:36px 20px;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)}\n.cer .ct{font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;color:var(--green-ink);font-weight:700}\n.cer h2{font-size:clamp(2.4rem,6vw,4rem);font-weight:900;margin:0}\n.podium3{display:grid;grid-template-columns:1fr 1.15fr 1fr;gap:12px;align-items:end;width:100%;max-width:900px}\n.pod{border-radius:var(--radius) var(--radius) 0 0;padding:16px 10px;display:grid;gap:6px;justify-items:center;min-width:0}\n.pod .pl{font-family:var(--f-display);font-weight:900;font-size:3rem;line-height:1}\n.pod .pnm{font-weight:700;font-size:clamp(1rem,2vw,1.35rem);overflow-wrap:anywhere}\n.pod .pm{font-family:var(--f-display);font-weight:900;font-size:clamp(1.6rem,3.4vw,2.4rem);color:var(--gold);line-height:1}\n.pod.p1{background:color-mix(in srgb,var(--gold) 22%,var(--panel-2));min-height:240px;border-top:4px solid var(--gold)}\n.pod.p2{background:var(--panel-2);min-height:190px;border-top:4px solid var(--muted)}\n.pod.p3{background:var(--panel-2);min-height:160px;border-top:4px solid #b07a4a}\n.rest6{list-style:none;margin:0;padding:0;display:grid;gap:6px;width:100%;max-width:640px}\n.rest6 li{display:grid;grid-template-columns:48px 1fr auto;gap:10px;align-items:center;background:var(--panel-2);border-radius:var(--radius);padding:8px 12px;text-align:left}\n.rest6 b{font-family:var(--f-display);font-weight:900;font-size:1.4rem}\n.rest6 .pm{font-family:var(--f-display);font-weight:800;color:var(--gold);font-size:1.2rem}\n\n/* Recap */\n.recap{aspect-ratio:4/5;max-width:400px;width:100%;background:#0b100c;color:#eef2ec;border-radius:10px;padding:22px;display:grid;grid-template-rows:auto auto auto 1fr auto;gap:12px;position:relative;overflow:hidden;border:1px solid var(--line);justify-self:center}\n.recap::after{content:\"\";position:absolute;right:-90px;top:-90px;width:260px;height:260px;border-radius:50%;border:2px solid rgba(43,198,83,.25);box-shadow:0 0 0 30px rgba(227,2,18,.08),0 0 0 60px rgba(43,198,83,.06);pointer-events:none}\n.recap .rt{font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:#7be095;font-weight:700;position:relative;z-index:1}\n.recap .rw{font-family:var(--f-display);font-weight:900;font-size:2.3rem;line-height:.92;text-transform:uppercase;position:relative;z-index:1}\n.recap .rw small{display:block;line-height:1.3;font-size:.86rem;font-family:var(--f-body);font-weight:600;color:#9fb0a3;letter-spacing:.02em;margin-top:6px;text-transform:none}\n.recap .tm{color:#9fb0a3;border-color:#26332a}\n.rleg{display:grid;gap:4px}\n.rleg .lh{font-size:.64rem;letter-spacing:.14em;text-transform:uppercase;color:#9fb0a3;font-weight:700}\n.rleg .lv{display:flex;gap:5px;flex-wrap:wrap}\n.rleg .lv span{font-family:var(--f-display);font-weight:800;font-size:1.15rem;background:rgba(255,255,255,.08);border-radius:4px;padding:2px 8px}\n.rleg .lv span.co{background:#2BC653;color:#06120a}\n.rpod{list-style:none;margin:0;padding:0;display:grid;gap:5px;align-self:center}\n.rpod li{display:grid;grid-template-columns:24px 1fr auto;align-items:center;font-weight:600;font-size:.9rem;gap:6px}\n.rpod b{font-family:var(--f-display);font-weight:900;font-size:1.2rem;color:#E6B43A}\n.rpod span.r{font-size:.8rem;color:#9fb0a3;font-variant-numeric:tabular-nums}\n.rstats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;border-top:1px solid #26332a;padding-top:10px}\n.rstats b{display:block;font-family:var(--f-display);font-weight:900;font-size:1.6rem;line-height:1;color:#E6B43A}\n.rstats span{font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:#9fb0a3;font-weight:700}\n\n/* Saison */\n.sbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap}\n.fmtsel{margin:0 0 14px}.fmtrow{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-top:6px}.fmtb{text-align:left;padding:10px 12px;border-radius:var(--radius);border:1px solid var(--line);background:var(--bg);color:var(--ink);cursor:pointer;display:grid;gap:2px;font:inherit}.fmtb b{font-size:1rem}.fmtb span{font-size:.8rem;color:var(--muted)}.fmtb.on{border-color:var(--green);box-shadow:inset 0 0 0 1.5px var(--green)}\n.dkoh{margin:14px 0 6px;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}\n.sbar select{background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:var(--radius);padding:12px 40px 12px 16px;font:inherit;font-size:1.1rem;font-weight:700;min-height:48px;min-width:180px;cursor:pointer}\n/* Aufgeklappte Auswahllisten: dunkles Systemmen\u00fc, gut lesbare Schrift (vorher wei\u00dfe Schrift auf wei\u00dfem Men\u00fc) */\nselect{color-scheme:dark}\nselect option{background:#151a17;color:#f2f2ee;font-size:1.05rem;font-weight:600;padding:8px}\n.pot{display:grid;grid-template-columns:auto 1fr;gap:6px 24px;align-items:center}\n.pot .pv{font-family:var(--f-display);font-weight:900;font-size:clamp(3rem,7vw,4.6rem);line-height:.9;color:var(--gold)}\n.pot .pd{font-size:.9rem;color:var(--muted)}\n.pot .pd b{color:var(--ink)}\n.pbar{grid-column:1/-1;height:10px;background:var(--panel-2);border-radius:99px;overflow:hidden}\n.pbar i{display:block;height:100%;background:var(--gold)}\n.split{display:flex;gap:6px;flex-wrap:wrap;grid-column:1/-1}\n.split span{background:var(--panel-2);border-radius:99px;padding:4px 10px;font-size:.8rem;font-variant-numeric:tabular-nums}\n.split span b{color:var(--gold)}\n.qchip{font-size:.66rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:2px 7px;border-radius:99px;white-space:nowrap}\n.qchip.ok{background:color-mix(in srgb,var(--green) 22%,transparent);color:var(--green-ink)}\n.qchip.no{background:var(--panel-2);color:var(--muted)}\n.sched{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:6px}\n.sched div{background:var(--panel-2);border-radius:var(--radius);padding:8px 10px;display:grid;gap:2px;border-top:3px solid var(--line)}\n.sched div.ms{border-top-color:var(--green)}\n.sched div.sp{border-top-color:var(--gold)}\n.sched div.today{outline:2px solid var(--green)}\n.sched span{font-size:.72rem;color:var(--muted);font-variant-numeric:tabular-nums}\n.sched b{font-size:.86rem;line-height:1.2}\n.lbs{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:10px}\n.lb{background:var(--panel-2);border-radius:var(--radius);padding:12px 14px;display:grid;gap:6px;min-width:0;align-content:start}\n.lb h4{margin:0;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}\n.lb ol{margin:0;padding:0;list-style:none;display:grid;gap:4px}\n.lb li{display:grid;grid-template-columns:18px 1fr auto;gap:8px;align-items:baseline;font-size:.9rem}\n.lb li i{font-style:normal;color:var(--muted);font-size:.78rem}\n.lb li b{font-variant-numeric:tabular-nums}\n.lb li:first-child b{color:var(--gold)}\n.plink{background:none;border:0;padding:0;color:inherit;font:inherit;text-align:left;cursor:pointer;text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}\n.plink:hover{text-decoration-color:var(--green-ink)}\n\n/* Profil */\n.prof-head{display:grid;grid-template-columns:180px minmax(0,1fr);gap:20px;align-items:start}\n.ph{aspect-ratio:4/5;border-radius:var(--radius);overflow:hidden;background:radial-gradient(circle at 50% 40%,#1f2d23,#0b110d);display:grid;place-items:center;max-width:100%}\n.ph img{width:100%;height:100%;object-fit:cover;display:block}\n.ph .ini{font-family:var(--f-display);font-weight:900;font-size:4rem;color:var(--muted)}\n.pinfo{display:grid;gap:10px;min-width:0}\n.pinfo .nick{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:700}\n.pinfo .pname{font-family:var(--f-display);font-weight:900;font-size:clamp(2.2rem,5vw,3.4rem);line-height:.9;text-transform:uppercase}\n.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px}\n.kpi{background:var(--panel-2);border-radius:var(--radius);padding:10px 12px;display:grid;gap:2px}\n.kpi b{font-family:var(--f-display);font-weight:900;font-size:2rem;line-height:1}\n.kpi span{font-size:.64rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700}\n.kpi em{font-style:normal;font-size:.76rem;font-weight:700}\n.up{color:var(--green-ink)}.down{color:#ff8a92}\n.badges{display:flex;flex-wrap:wrap;gap:6px}\n.badge{display:inline-flex;align-items:center;gap:6px;font-size:.78rem;font-weight:600;padding:4px 10px 4px 4px;border-radius:99px;background:var(--panel-2)}\n.badge i{min-width:22px;height:22px;padding:0 4px;border-radius:99px;display:grid;place-items:center;font-style:normal;font-size:.6rem;font-weight:800;color:#0b100c}\n.badge.off{opacity:.38}\n.badge.off i{background:var(--muted)!important}\n.vis svg{display:block;width:100%;height:auto;overflow:visible;max-width:720px;margin:0 auto}\n.vis svg[viewBox^=\"0 0 300\"]{max-width:400px}\n.cap{font-size:.74rem;color:var(--muted);margin:8px 0 0}\n.lg2{display:flex;gap:6px 14px;flex-wrap:wrap;font-size:.8rem;margin-bottom:8px}\n.lg2 span{display:inline-flex;align-items:center;gap:6px}\n.lg2 i{width:11px;height:11px;border-radius:2px;display:inline-block}\n.hb{display:grid;gap:12px}\n.hbrow{display:grid;grid-template-columns:90px 1fr 60px;gap:10px;align-items:center;font-size:.9rem}\n.hbrow .tr{height:16px;background:var(--panel-2);border-radius:99px;overflow:hidden;position:relative}\n.hbrow .tr i{position:absolute;inset:0 auto 0 0;border-radius:99px}\n.hbrow .tr u{position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--ink);opacity:.6}\n.hbrow b{font-family:var(--f-display);font-weight:800;font-size:1.3rem;text-align:right}\n.bignum{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px}\n.bignum div{background:var(--panel-2);border-radius:var(--radius);padding:12px}\n.bignum b{display:block;font-family:var(--f-display);font-weight:900;font-size:2.4rem;line-height:1;color:var(--gold)}\n.bignum span{font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700}\n.evrows{list-style:none;margin:0;padding:0;display:grid;gap:6px}\n.evrows li{display:grid;grid-template-columns:70px 1fr auto auto;gap:12px;align-items:center;background:var(--panel-2);border-radius:var(--radius);padding:8px 12px;font-size:.88rem}\n.evrows .d{color:var(--muted);font-variant-numeric:tabular-nums}\n.evrows .pl{font-family:var(--f-display);font-weight:800;font-size:1.15rem}\n@media (max-width:640px){.prof-head{grid-template-columns:110px minmax(0,1fr)}.podium3{grid-template-columns:1fr}.pod{min-height:0!important;border-radius:var(--radius)}.pod.p1{order:-1}.evrows li{grid-template-columns:56px 1fr auto}.evrows li .x{display:none}}\n\n#view.wrap{max-width:none;padding:0}\n"+'</style><div class="wrap" id="view" aria-live="polite"></div>';
window.CDA_CFG={mode:'site',root:root,host:host};})();

(function(){
'use strict';
var CFG=window.CDA_CFG||{mode:'app'},SITE=CFG.mode==='site',DOC=CFG.root||document;
/* ================= Zufall (Beispiel-Saison reproduzierbar) ================= */
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
var RNG=mulberry(1986);
function rnd(a,b){return a+Math.floor(RNG()*(b-a+1));}
function gauss(){return(RNG()+RNG()+RNG()+RNG()-2)/2*1.7;}
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(RNG()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function sum(a){return a.reduce(function(s,x){return s+x;},0);}

/* ================= Dart-Grundlagen ================= */
var DARTS=[];
(function(){var i;for(i=20;i>=1;i--)DARTS.push({n:'T'+i,v:3*i});DARTS.push({n:'Bull',v:50});DARTS.push({n:'25',v:25});for(i=20;i>=1;i--)DARTS.push({n:String(i),v:i});for(i=20;i>=1;i--)DARTS.push({n:'D'+i,v:2*i});})();
var SETUP=DARTS.filter(function(d){return d.n[0]!=='D'&&d.n!=='Bull';});SETUP.splice(11,0,{n:'Bull',v:50});
var DPREF=['D20','D16','D8','D18','D12','D10','D14','D4','D6','D2','D19','D17','D15','D13','D11','D9','D7','D5','D3','D1','Bull'];
var DOUBLES=DPREF.map(function(n){return n==='Bull'?{n:'Bull',v:50}:{n:n,v:2*+n.slice(1)};});
var CO={};
(function(){for(var r=2;r<=170;r++){var best=null,j,a,b,d;
  for(j=0;j<DOUBLES.length&&!best;j++)if(DOUBLES[j].v===r&&(r<=40||r===50))best=[DOUBLES[j].n];
  if(!best)for(j=0;j<DOUBLES.length&&!best;j++){d=DOUBLES[j];for(a=0;a<SETUP.length;a++)if(SETUP[a].v+d.v===r){best=[SETUP[a].n,d.n];break;}}
  if(!best){outer:for(j=0;j<DOUBLES.length;j++){d=DOUBLES[j];for(a=0;a<SETUP.length;a++)for(b=0;b<SETUP.length;b++)if(SETUP[a].v+SETUP[b].v+d.v===r){best=[SETUP[a].n,SETUP[b].n,d.n];break outer;}}}
  if(best)CO[r]=best;}})();
var VALID={};(function(){var all=[0].concat(DARTS.map(function(d){return d.v;}));all.forEach(function(a){all.forEach(function(b){all.forEach(function(c){VALID[a+b+c]=1;});});});})();
var CNUM=[20,19,18,17,16,15,25];

/* ================= Spielmodi, Geld, Rotation ================= */
var MODES={
  m501:{name:'CDA Masters',sub:'501 Double-out',kind:'x01',start:501,masters:true,min:14,desc:'Alle 3 Wochen. Zählt für Rangliste und Finals. Startgeld 15 €: 5 € Tagespreisgeld für die Top 3, 10 € in den Masters-Pott.'},
  c501:{name:'Competition 501',sub:'501 Double-out',kind:'x01',start:501,min:14,desc:'Ganz normal 501, ohne Masters-Wertung. Der Standard-Donnerstag.'},
  di301:{name:'301 Double-In',sub:'301 Double-in · Double-out',kind:'x01',start:301,di:true,min:10,desc:'Punkte zählen erst nach dem ersten Doppel. Kurz und gemein.'},
  friend:{name:'Bring a Friend',sub:'Mitglied + Gast im Doppel · 501',kind:'x01',start:501,doubles:true,friend:true,min:16,desc:'Saisonstart und etwa alle 4 Monate. Jedes Mitglied spielt mit seinem Gast im Doppel.'},
  lucky:{name:'Lucky Doubles',sub:'Zugeloste Doppel · 501',kind:'x01',start:501,doubles:true,min:16,desc:'Etwa alle 3 Monate. Stark und schwach werden zusammengelost.'},
  cricket:{name:'Cricket-Nacht',sub:'15 bis 20 und Bull · mit Punkten',kind:'cricket',min:16,desc:'Etwa alle 7 Wochen. Felder schließen, Punkte sammeln.'},
  finals:{name:'CDA-Masters-Finals',sub:'2 Gruppenphasen · K.-o. · Plätze 1–6',kind:'x01',start:501,finals:true,min:14,desc:'Saisonabschluss beim TSV Dinkelscherben. Teilnahme ab 5 Masters-Abenden. Der Pott geht an die Top 5.'}
};
var FEE=15,DAY_FEE=5,POT_FEE=10,MIN_QUALI=5,MAX_FINALS=32,MASTERS_PER_SEASON=16,BEST_OF=10,PTS_START=5,PTS_BEHIND=2,PTS_WIN=1,PTS_BONUS={1:10,2:6,3:3};
var DAY_SPLIT=[.5,.3,.2],FIN_SPLIT=[.40,.25,.17,.12,.06];
function payout(total,pcts){var r=pcts.map(function(p){return Math.floor(total*p*2)/2;});r[0]=Math.round((r[0]+total-sum(r))*2)/2;return r;}
function eur(x){var s=(Math.round(x*100)/100).toFixed(2).replace('.',',');return s.replace(/,00$/,'')+' €';}
var SEASON_START='2026-09-17';
function addDays(d,n){var t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10);}

/* Terminkalender: Masters-Saison = Kalenderjahr, Start am ersten Donnerstag ab 7. Januar,
   keine Termine vom 23.12. bis 6.1., 16 Masters-Abende, Finals am Samstag 9 Tage nach dem letzten Masters-Abend */
function cdaCalendar(year){
  var out=[],d=new Date(Date.UTC(year,0,7,12)),i=0,ms=0,fin=false,lf=-99,lc=0,ll=2,alt=0;
  while(d.getUTCDay()!==4)d.setUTCDate(d.getUTCDate()+1);
  for(;d.getUTCFullYear()===year;d.setUTCDate(d.getUTCDate()+7)){
    var iso=d.toISOString().slice(0,10);if(iso.slice(5)>='12-23')continue;
    var m=null;
    if(i%3===1&&ms<16){m='m501';ms++;}
    if(!m){var w=i;if(i===0||w-lf>=17){m='friend';lf=w;}else if(w-lc>=7){m='cricket';lc=w;}else if(w-ll>=11){m='lucky';ll=w;}else{m=(alt++%2)?'di301':'c501';}}
    out.push({date:iso,mode:m});i++;
  }
  var lm=null;out.forEach(function(e){if(e.mode==='m501')lm=e.date;});
    if(lm&&ms>=16){out.forEach(function(e){if(e.date===addDays(lm,7))e.note='Finals am Samstag';});out.push({date:addDays(lm,9),mode:'finals'});out.sort(function(a,b){return a.date<b.date?-1:1;});}
    return out;
}
var CALS={};function cal(y){return CALS[y]||(CALS[y]=cdaCalendar(+y));}
function calMode(date){var e=cal(date.slice(0,4)).filter(function(x){return x.date===date;})[0];return e?e.mode:'c501';}
function nextCalDate(date){var all=cal(date.slice(0,4)).concat(cal(String(+date.slice(0,4)+1)));return all.filter(function(x){return x.date>date&&x.mode!=='finals';})[0].date;}

function wdS(d){return['So','Mo','Di','Mi','Do','Fr','Sa'][new Date(d+'T12:00:00Z').getUTCDay()];}
function dshort(d){return d.slice(8,10)+'.'+d.slice(5,7)+'.';}

/* ================= Spieler ================= */
var PLAYERS=[];var uid=0;
function P(name,skill,team,guest,att,by){var p={id:++uid,name:name,skill:skill,team:team||'',guest:!!guest,att:att||.5,by:by||null};PLAYERS.push(p);return p;}
P('Leon Kesselring',72,'I',0,.95);P('Marcus Kreiner',64,'I',0,.8);P('Ivo Schubert',69,'I',0,.85);P('Florian Kaiser',76,'I',0,.6);P('Marco Geiger',74,'I',0,.45);
P('Bastian Rauh',73,'I',0,.4);P('Leon Crump',75,'I',0,.5);P('Simon Schreier',66,'I',0,.55);P('Tobias Jäckle',52,'I',0,.4);P('Leo Hörmann',63,'I/II',0,.6);
P('Andreas Mors',62,'II',0,.9);P('Jonas Thoma',70,'II',0,.7);P('Ewald Lautenschlager',58,'II',0,.5);P('Michael Voigt',55,'II',0,.35);P('Robert Strehl',55,'II/III',0,.6);
P('Carola Wüstner',50,'III',0,.45);P('Dennis Mandl',54,'III',0,.3);P('Adrian Seidl',52,'IV',0,.4);P('Sebastian Röck',50,'IV',0,.3);
P('Max (Gast)',42,'',1,.3,1);P('Sophie (Gast)',38,'',1,.3,11);P('Tom (Gast)',45,'',1,.25,3);P('Lisa (Gast)',40,'',1,.12,2);P('Jan (Gast)',47,'',1,.12,12);P('Kevin (Gast)',51,'',1,.12,4);
P('Franz Rötzsch',71,'I',0,.35);P('Jürgen Pistl',67,'I',0,.35);P('Markus Stiegeler',61,'I',0,.3);P('Markus Görg',57,'I',0,.3);P('Florian Zitzler',60,'I',0,.3);
P('Sancha Koal',62,'I',0,.3);P('Simon Seifert',63,'I',0,.35);P('Dominik Thoma',59,'II',0,.25);P('Martin Hungbaur',56,'II',0,.25);P('Manfred Tochtermann',51,'III',0,.25);
P('Markus Ziegler',49,'III',0,.2);P('Andreas Wengenmayr',48,'IV',0,.2);P('Clemens Fleischmann',47,'IV',0,.2);P('Maximilian Urban',50,'IV',0,.2);P('Gerald Nitzer',46,'IV',0,.2);
var NICK={1:'The Lion'},PHOTO=(function(){var F=["bastian-rauh", "florian-kaiser", "ivo-schubert", "leo-hoermann", "leon-crump", "leon-kesselring", "marco-geiger", "marcus-kreiner", "markus-goerg", "sancha-koal", "simon-seifert"],o={};PLAYERS.forEach(function(p){var s=p.name.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');if(F.indexOf(s)>=0)o[p.id]='spieler/'+s+'.webp';});return o;})();
function pl(id){for(var i=0;i<PLAYERS.length;i++)if(PLAYERS[i].id===id)return PLAYERS[i];return null;}
function pn(id){var p=pl(id);return p?p.name:'offen';}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function tmTag(t){return t?' <span class="tm" title="CDA '+t+'">'+t+'</span>':'';}
function pnh(id){var p=pl(id);return p?esc(p.name)+tmTag(p.team):'offen';}
function plink(id){return '<button class="plink" data-act="prof" data-id="'+id+'">'+esc(pn(id))+'</button>'+tmTag((pl(id)||{}).team);}
function fmt2(x){return x?x.toFixed(2).replace('.',','):'–';}
function fmt1(x){return x?x.toFixed(1).replace('.',','):'–';}
function pct(x){return x==null||isNaN(x)?'–':Math.round(x*100)+' %';}

/* ================= Abend (Engine) ================= */
var CUR_SEASON='2027';
function newEv(mode,date,boards,season){var n=boards.length;return{mode:mode,date:date,season:season||CUR_SEASON,btype:boards.slice(),phase:'checkin',pids:[],parts:{},matches:[],groups:[],groups2:null,plan:null,boards:new Array(n).fill(null),last:{},tick:0,prevLoser:new Array(n).fill(null),hl:[],mid:0,writes:{},cin:Array.from({length:n},function(){return[];}),ask:{}};}
function MD(ev){return MODES[ev.mode];}
function partH(ev,id){var p=ev.parts[id];return p?p.members.map(pnh).join(' & '):'Sieger offen';}
function partN(ev,id){var p=ev.parts[id];return p?p.members.map(pn).join(' & '):'offen';}
function mkParts(ev,pids){
  var md=MD(ev),teams=[],pool=pids.slice();ev.parts={};
  if(md.friend){pids.forEach(function(g){var by=pl(g).by;if(by&&pool.indexOf(g)>=0&&pool.indexOf(by)>=0){teams.push([by,g]);pool.splice(pool.indexOf(g),1);pool.splice(pool.indexOf(by),1);}});}
  if(md.doubles&&pool.length>=2){
    var s=pool.slice().sort(function(a,b){return pl(b).skill-pl(a).skill;}),n=Math.floor(s.length/2),strong=shuffle(s.slice(0,n)),weak=shuffle(s.slice(n)),t0=teams.length;
    strong.forEach(function(p){teams.push([p]);});weak.forEach(function(p,i){teams[t0+i%n].push(p);});
  }else if(md.doubles){if(pool.length)teams[teams.length-1].push(pool[0]);}
  else teams=pids.map(function(p){return[p];});
  return teams.map(function(mem,k){var id=1000+k;ev.parts[id]={id:id,members:mem,start:md.start||0,skill:sum(mem.map(function(p){return pl(p).skill;}))/mem.length};return id;});
}
function sizesFor(n,g){var s=[];for(var i=0;i<g;i++)s.push(Math.floor(n/g)+(i<n%g?1:0));return s;}
function pairsIn(s){return sum(s.map(function(k){return k*(k-1)/2;}));}
function finalsShape(n){var target=Math.ceil(n*.75),K=4;while(K*2*1.5<=target)K*=2;return{g1:Math.ceil(n/4),A:K*1.5,K:K};}
/* Legs: ft = first to (1 = Best of 1, 2 = Best of 3, 3 = Best of 5, 4 = Best of 7) */
var LEG_LVL=['Standard','Kürzer','Kurz','Sehr kurz'];
var LEG_PRE={x:[{g:2,g2:2,ko:2,fin:3,wb:2,lb:1,late:2,side:2,sk:2},{g:1,g2:1,ko:2,fin:3,wb:1,lb:1,late:2,side:2,sk:1},{g:1,g2:1,ko:2,fin:2,wb:1,lb:1,late:1,side:2,sk:1},{g:1,g2:1,ko:1,fin:2,wb:1,lb:1,late:1,side:1,sk:1}],
  f:[{g:2,g2:2,ko:3,fin:3},{g:1,g2:2,ko:3,fin:3},{g:1,g2:1,ko:2,fin:3},{g:1,g2:1,ko:2,fin:2}]};
var DKO_KEYS=['wb','lb','late','side','fin'];
function legPreset(md,lvl){var L=LEG_PRE[md.finals?'f':'x'][lvl],o={};for(var k in L)o[k]=L[k];return o;}
/* Legs je Doppel-K.-o.-Runde: Anfang Gewinnerseite / Anfang Verliererseite / späte Runden (Halbfinals) / Finale beider Seiten / großes Finale */
function dkoFt(x,L){var g=function(k,f){return L[k]||L[f]||1;};if(x.br==='F')return g('fin','fin');if(x.top||x.last)return g('side','ko');if(x.late)return g('late','ko');return x.br==='W'?g('wb','g'):g('lb','g');}
function legsOf(ev){return ev.legs||legPreset(MD(ev),0);}
function bo(ft){return 'Best of '+(ft*2-1);}
var LEXP={1:1,2:2.5,3:4.1,4:5.6};
function mMin(md,ft){return md.min*(.25+.75*LEXP[ft]/2.5);}
function legTxt(md,L,p){if(p&&p.sko)return 'Erste Runden '+bo(L.sk||L.ko)+' · Halbfinale '+bo(L.late||L.ko)+' · Spiel um Platz 3 '+bo(L.side||L.ko)+' · Finale '+bo(L.fin);if(p&&p.dko)return 'Gewinnerseite '+bo(L.wb||L.g)+' · Verliererseite '+bo(L.lb||L.g)+' · Halbfinals '+bo(L.late||L.ko)+' · Seitenfinals '+bo(L.side||L.ko)+' · Finale '+bo(L.fin);return (md.finals?'Vorrunde '+bo(L.g)+' · Zwischenrunde '+bo(L.g2)+' · K.-o. '+bo(L.ko):'Gruppe '+bo(L.g)+' · K.-o. '+bo(L.ko))+' · Finale '+bo(L.fin);}
function makePlan(n,mode,nb,L,fmt){
  var md=MODES[mode];if(n<3)return null;nb=nb||2;L=L||legPreset(md,0);
  var fm=fmt||(S&&S.fmt);if(!md.finals&&fm==='dko'&&n>=4)return dkoPlan(n,md,nb,L);
  if(!md.finals&&fm==='sko'&&n>=4)return skoPlan(n,md,nb,L);
  if(md.finals){
    if(n<8)return null;var f=finalsShape(n),s1=sizesFor(n,f.g1),gm1=pairsIn(s1),gm2=f.K/2*3,ko=f.K-1+1+(f.K>=8?3:0),total=gm1+gm2+ko;
    var dur=Math.round((gm1*mMin(md,L.g)+gm2*mMin(md,L.g2)+(ko-1)*mMin(md,L.ko)+mMin(md,L.fin))/nb*1.1);
    return{finals:true,n:n,g:f.g1,sizes:s1,A:f.A,K:f.K,gm:gm1+gm2,total:total,dur:dur,q:f.K,
      txt:f.g1+' Vierergruppen → '+f.A+' weiter · '+(f.K/2)+' Dreiergruppen → '+f.K+' im K.-o. · Plätze 1 bis 6 ausgespielt',warn:false};
  }
  var g=n<=6?1:n<=10?2:n<=11?3:4,q=g===1?2:g===2?4:8,sizes=sizesFor(n,g),gm=pairsIn(sizes);
  var ko=q===2?1:q===4?4:8;
  var dur=Math.round((gm*mMin(md,L.g)+(ko-1)*mMin(md,L.ko)+mMin(md,L.fin))/nb*1.1);
  var txt=g===1?'Jeder gegen jeden, danach Finale':g+' Gruppen, danach '+(q===4?'Halbfinale, Spiel um Platz 3 und Finale':'Viertelfinale, Halbfinale, Spiel um Platz 3 und Finale');
  return{n:n,g:g,q:q,sizes:sizes,gm:gm,total:gm+ko,dur:dur,txt:txt,warn:n>7*nb};
}
/* ===== Doppel-K.-o.: Gewinnerseite (W) und Verliererseite (L), wer zweimal verliert, ist raus =====
   Freilose werden schon beim Auslosen herausgerechnet: es entstehen nur echte Spiele. */
function dkoNodes(n){
  var K=2;while(K<n)K*=2;var k=Math.log2(K),order=bracketOrder(K),nodes=[],i,r,j;
  function node(o){o.i=nodes.length;nodes.push(o);return o;}
  function seed(pos){var sd=order[pos];return sd<=n?{s:sd-1}:{e:1};}
  var WB=[],LB=[],r1=[];for(i=0;i<K;i+=2)r1.push(node({br:'W',r:1,A:seed(i),B:seed(i+1)}));WB.push(r1);
  for(r=2;r<=k;r++){var pv=WB[r-2],cu=[];for(i=0;i<pv.length;i+=2)cu.push(node({br:'W',r:r,A:{w:pv[i]},B:{w:pv[i+1]}}));WB.push(cu);}
  var lr=1,last=[];for(i=0;i<r1.length;i+=2)last.push(node({br:'L',r:lr,A:{l:r1[i]},B:{l:r1[i+1]}}));LB.push(last);
  for(j=1;j<=k-1;j++){var wl=WB[j].slice();if(j%2)wl.reverse();var mj=[];lr++;
    for(i=0;i<last.length;i++)mj.push(node({br:'L',r:lr,A:{w:last[i]},B:{l:wl[i]}}));LB.push(mj);last=mj;
    if(j<k-1){var mn=[];lr++;for(i=0;i<last.length;i+=2)mn.push(node({br:'L',r:lr,A:{w:last[i]},B:{w:last[i+1]}}));LB.push(mn);last=mn;}}
  node({br:'F',r:1,A:{w:WB[k-1][0]},B:{w:last[0]}});
  // Freilose auflösen: Spiele mit leerer Seite fallen weg, der andere rückt direkt weiter
  function canon(x){if(x.e)return x;if(x.s!=null)return x;var nd=x.w||x.l;if(nd.empty)return{e:1};if(nd.bye)return x.w?nd.pass:{e:1};return x;}
  nodes.forEach(function(nd){nd.A=canon(nd.A);nd.B=canon(nd.B);if(nd.A.e&&nd.B.e)nd.empty=true;else if(nd.A.e||nd.B.e){nd.bye=true;nd.pass=nd.A.e?nd.B:nd.A;}});
  var lmax=Math.max.apply(null,nodes.filter(function(x){return x.br==='L'&&!x.empty&&!x.bye;}).map(function(x){return x.r;}).concat([0]));
  var real=nodes.filter(function(x){return !x.empty&&!x.bye;});
  real.forEach(function(x){x.lvl=x.br==='W'?2*x.r-1:x.br==='L'?x.r+1:99;x.last=x.br==='L'&&x.r===lmax;x.top=x.br==='W'&&x.r===k;x.late=!x.last&&!x.top&&(x.br==='W'?x.r===k-1:x.r>=lmax-2);});
  real.sort(function(a,b){return a.lvl-b.lvl||a.i-b.i;});return{real:real,k:k,lmax:lmax};
}
function dkoName(x,k){return x.br==='F'?'Finale':x.br==='W'?(x.top?'Finale Gewinnerseite':'Gewinnerseite · Runde '+x.r):(x.last?'Finale Verliererseite':'Verliererseite · Runde '+x.r);}
function dkoPlan(n,md,nb,L){var D=dkoNodes(n),sumMin=0;D.real.forEach(function(x){sumMin+=mMin(md,dkoFt(x,L));});
  var dur=Math.round(sumMin/nb*1.1+(1-1/nb)*(2*mMin(md,L.side||L.ko)+mMin(md,L.fin)));
  return{n:n,dko:true,g:0,q:0,sizes:[],gm:0,total:D.real.length,dur:dur,warn:n>9*nb,
    txt:'Doppel-K.-o.: Wer verliert, rutscht auf die Verliererseite – erst die zweite Niederlage scheidet aus. Im Finale trifft der Sieger der Gewinnerseite auf den Sieger der Verliererseite.'};}
function buildDKO(ev,ids){var D=dkoNodes(ids.length),LL=legsOf(ev);
  D.real.forEach(function(x){var o={kind:'KO',dk:x.br,dr:x.r,stage:dkoName(x,D.k),ft:dkoFt(x,LL)};
    [['A','a','fromA','fromAL'],['B','b','fromB','fromBL']].forEach(function(q){var src=x[q[0]];if(src.s!=null)o[q[1]]=ids[src.s];else{var nd=src.w||src.l;o[q[2]]=nd.mid;if(src.l)o[q[3]]=1;}});
    var m=newMatch(ev,o);x.mid=m.id;ev.matches.push(m);});}
/* ===== Single-K.-o.: wer verliert, ist raus; Spiel um Platz 3 für die Halbfinal-Verlierer =====
   Freilose werden wie beim Doppel-K.-o. schon beim Auslosen herausgerechnet. */
function skoNodes(n){
  var K=2;while(K<n)K*=2;var k=Math.log2(K),order=bracketOrder(K),nodes=[],i,r,rounds=[];
  function node(o){o.i=nodes.length;nodes.push(o);return o;}
  function seed(pos){var sd=order[pos];return sd<=n?{s:sd-1}:{e:1};}
  var cur=[];for(i=0;i<K;i+=2)cur.push(node({br:'W',r:1,A:seed(i),B:seed(i+1)}));rounds.push(cur);
  for(r=2;r<=k;r++){var nx=[];for(i=0;i<cur.length;i+=2)nx.push(node({br:'W',r:r,A:{w:cur[i]},B:{w:cur[i+1]}}));rounds.push(nx);cur=nx;}
  var p3=k>=2?node({br:'P',r:k,A:{l:rounds[k-2][0]},B:{l:rounds[k-2][1]}}):null;
  function canon(x){if(x.e)return x;if(x.s!=null)return x;var nd=x.w||x.l;if(nd.empty)return{e:1};if(nd.bye)return x.w?nd.pass:{e:1};return x;}
  nodes.forEach(function(nd){nd.A=canon(nd.A);nd.B=canon(nd.B);if(nd.A.e&&nd.B.e)nd.empty=true;else if(nd.A.e||nd.B.e){nd.bye=true;nd.pass=nd.A.e?nd.B:nd.A;}});
  var real=nodes.filter(function(x){return !x.empty&&!x.bye;});
  real.forEach(function(x){var size=K/Math.pow(2,x.r-1);x.size=size;x.lvl=x.br==='P'?2*x.r-1:2*x.r-(x.r===k?0:2);});
  real.sort(function(a,b){return a.lvl-b.lvl||a.i-b.i;});return{real:real,k:k,K:K};
}
var RN_SK={2:'Finale',4:'Halbfinale',8:'Viertelfinale',16:'Achtelfinale',32:'Sechzehntelfinale',64:'Runde der letzten 64'};
function skoName(x){return x.br==='P'?'Spiel um Platz 3':RN_SK[x.size];}
function skoFt(x,L){var g=function(k,f){return L[k]||L[f]||1;};if(x.br==='P')return g('side','ko');if(x.size===2)return g('fin','fin');if(x.size===4)return g('late','ko');return g('sk','ko');}
function skoPlan(n,md,nb,L){var D=skoNodes(n),sumMin=0;D.real.forEach(function(x){sumMin+=mMin(md,skoFt(x,L));});
  var dur=Math.round(sumMin/nb*1.1+(1-1/nb)*(mMin(md,L.late||L.ko)+mMin(md,L.fin)));
  return{n:n,sko:true,g:0,q:0,sizes:[],gm:0,total:D.real.length,dur:dur,warn:n>12*nb,
    txt:'Single-K.-o.: Wer ein Match verliert, ist raus. Die Verlierer der Halbfinals spielen um Platz 3, die Sieger um den Turniersieg.'};}
function buildSKO(ev,ids){var D=skoNodes(ids.length),LL=legsOf(ev);
  D.real.forEach(function(x){var o={kind:'KO',sk:1,dr:x.r,stage:skoName(x),ft:skoFt(x,LL)};
    [['A','a','fromA','fromAL'],['B','b','fromB','fromBL']].forEach(function(q){var src=x[q[0]];if(src.s!=null)o[q[1]]=ids[src.s];else{var nd=src.w||src.l;o[q[2]]=nd.mid;if(src.l)o[q[3]]=1;}});
    var m=newMatch(ev,o);x.mid=m.id;ev.matches.push(m);});}
function clock(min){var t=20*60+min;return Math.floor(t/60)%24+':'+String(t%60).padStart(2,'0');}
function rr(ids){var a=ids.slice(),out=[],r,i;if(a.length%2)a.push(null);var n=a.length;
  for(r=0;r<n-1;r++){var round=[];for(i=0;i<n/2;i++){var x=a[i],y=a[n-1-i];if(x&&y)round.push(r%2?[y,x]:[x,y]);}out.push(round);a.splice(1,0,a.pop());}return out;}
function newMatch(ev,o){var m={id:++ev.mid,a:null,b:null,ft:2,legs:[],status:'wait',board:null,over:false,winner:null,order:ev.mid,writer:null,started:false};for(var k in o)m[k]=o[k];return m;}
var GL='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function snake(ids,g){var out=[];for(var i=0;i<g;i++)out.push([]);ids.forEach(function(id,k){var row=Math.floor(k/g),col=row%2?g-1-k%g:k%g;out[col].push(id);});return out;}
function addRR(ev,groups,ph,label){
  var rounds=groups.map(rr),maxR=Math.max.apply(null,rounds.map(function(r){return r.length;}));
  for(var r=0;r<maxR;r++)rounds.forEach(function(gr,gi){(gr[r]||[]).forEach(function(p){ev.matches.push(newMatch(ev,{kind:'G',ph:ph,group:gi,stage:label+' '+GL[gi],a:p[0],b:p[1],ft:legsOf(ev)[ph===2?'g2':'g']}));});});
}
function seasonPoints(pid,season){var r=mastersTable(ARCHIVE.filter(function(e){return e.season===season;}))[pid];return r?r.pts:0;}
function start(ev,pids){
  ev.pids=pids.slice();var md=MD(ev);
  var ids=mkParts(ev,pids);
  if(md.finals){var MTs=mastersTable(ARCHIVE.filter(function(e){return e.season===ev.season;}));var spt=function(p){return MTs[p]?MTs[p].pts:0;};ids.sort(function(a,b){var pa=ev.parts[a].members[0],pb=ev.parts[b].members[0];return spt(pb)-spt(pa)||pl(pb).skill-pl(pa).skill;});}
  else shuffle(ids);
  var plan=makePlan(ids.length,ev.mode,ev.boards.length,legsOf(ev));if(!plan)return false;ev.plan=plan;
  if(plan.dko){ev.groups=[];ev.groups2=null;ev.matches=[];buildDKO(ev,ids);ev.phase='running';fill(ev);return true;}
  if(plan.sko){ev.groups=[];ev.groups2=null;ev.matches=[];buildSKO(ev,ids);ev.phase='running';fill(ev);return true;}
  ev.groups=snake(ids,plan.g);ev.groups2=null;ev.matches=[];
  addRR(ev,ev.groups,1,md.finals?'Vorrunde':'Gruppe');
  ev.phase='running';fill(ev);return true;
}
function byId(ev,id){for(var i=0;i<ev.matches.length;i++)if(ev.matches[i].id===id)return ev.matches[i];return null;}
function winnerPart(m){return m&&m.status==='done'?(m.winner===0?m.a:m.b):null;}
function loserPart(m){return m&&m.status==='done'?(m.winner===0?m.b:m.a):null;}
function phaseDone(ev,ph){return ev.matches.every(function(m){return m.kind!=='G'||m.ph!==ph||m.status==='done';});}
function legsWon(m,s){return m.legs.filter(function(l){return l.winner===s;}).length;}
function curLeg(m){return m.legs[m.legs.length-1];}
function turn(leg){return(leg.starter+leg.visits.length)%2;}
function standings(ev,gi,ph){
  var grp=(ph===2?ev.groups2:ev.groups)[gi],rows={};grp.forEach(function(id){rows[id]={id:id,sp:0,s:0,n:0,lf:0,la:0,sc:0,dt:0,mk:0};});
  ev.matches.forEach(function(m){if(m.kind!=='G'||m.ph!==(ph||1)||m.group!==gi||m.status!=='done')return;
    var la=legsWon(m,0),lb=legsWon(m,1),A=rows[m.a],B=rows[m.b];A.sp++;B.sp++;A.lf+=la;A.la+=lb;B.lf+=lb;B.la+=la;
    if(m.winner===0){A.s++;B.n++;}else{B.s++;A.n++;}
    m.legs.forEach(function(l){l.visits.forEach(function(v){var R=v.p===0?A:B;R.dt+=v.darts;if(!v.bust)R.sc+=v.score||0;R.mk+=v.marks||0;});});
  });
  var cr=MD(ev).kind==='cricket';
  return Object.keys(rows).map(function(k){var r=rows[k];r.q=r.dt?(cr?r.mk/r.dt*3:r.sc/r.dt*3):0;return r;})
    .sort(function(x,y){return y.s-x.s||(y.lf-y.la)-(x.lf-x.la)||y.lf-x.lf||y.q-x.q;});
}
function rankAcross(ev,ph){
  var gs=ph===2?ev.groups2:ev.groups,rows=[];
  gs.forEach(function(g,gi){standings(ev,gi,ph).forEach(function(r,i){r.place=i;rows.push(r);});});
  var bp=function(a,b){return a.place-b.place||b.s/(b.sp||1)-a.s/(a.sp||1)||(b.lf-b.la)/(b.sp||1)-(a.lf-a.la)/(a.sp||1)||b.q-a.q;};
  return rows.sort(bp);
}
function bracketOrder(K){var o=[1];while(o.length<K){var n=o.length*2,x=[];o.forEach(function(s){x.push(s,n+1-s);});o=x;}return o;}
var RN={2:'Finale',4:'Halbfinale',8:'Viertelfinale',16:'Achtelfinale',32:'Sechzehntelfinale'};
function buildKO(ev,seeds,finals){
  var LL=legsOf(ev),K=seeds.length,order=bracketOrder(K),round=[],i,ftKO=LL.ko,ftF=LL.fin;
  if(K===2){ev.matches.push(newMatch(ev,{kind:'KO',stage:'Finale',a:seeds[0],b:seeds[1],ft:ftF}));return;}
  for(i=0;i<K;i+=2)round.push(newMatch(ev,{kind:'KO',stage:RN[K],a:seeds[order[i]-1],b:seeds[order[i+1]-1],ft:ftKO}));
  ev.matches=ev.matches.concat(round);var size=K/2,qf=K===8?round:null,sf=null;
  while(size>1){var next=[];for(i=0;i<round.length;i+=2)next.push(newMatch(ev,{kind:'KO',stage:RN[size],fromA:round[i].id,fromB:round[i+1].id,ft:size===2?ftF:ftKO}));
    if(size===8)qf=next;if(size===2)sf=round;
    ev.matches=ev.matches.concat(next);round=next;size/=2;}
  if(!sf)sf=ev.matches.filter(function(m){return m.stage==='Halbfinale';});
  var fin=ev.matches.filter(function(m){return m.stage==='Finale';})[0];
  ev.matches.splice(ev.matches.indexOf(fin),0,newMatch(ev,{kind:'KO',stage:'Spiel um Platz 3',fromA:sf[0].id,fromAL:1,fromB:sf[1].id,fromBL:1,ft:ftKO}));
  if(finals&&qf&&qf.length===4){
    var p1=newMatch(ev,{kind:'KO',stage:'Platz 5–8',fromA:qf[0].id,fromAL:1,fromB:qf[1].id,fromBL:1,ft:ftKO}),p2=newMatch(ev,{kind:'KO',stage:'Platz 5–8',fromA:qf[2].id,fromAL:1,fromB:qf[3].id,fromBL:1,ft:ftKO});
    ev.matches.push(p1,p2,newMatch(ev,{kind:'KO',stage:'Spiel um Platz 5',fromA:p1.id,fromB:p2.id,ft:ftKO}));
  }
}
function resolveKO(ev){ev.matches.forEach(function(m){
  if(m.fromA&&!m.a){var x=byId(ev,m.fromA);m.a=m.fromAL?loserPart(x):winnerPart(x);}
  if(m.fromB&&!m.b){var y=byId(ev,m.fromB);m.b=m.fromBL?loserPart(y):winnerPart(y);}});}
function memBusy(ev,pid){return ev.boards.some(function(id){var m=byId(ev,id);if(!m)return false;if(m.writer===pid)return true;return [m.a,m.b].some(function(p){return ev.parts[p]&&ev.parts[p].members.indexOf(pid)>=0;});});}
function partBusy(ev,id){return ev.parts[id].members.some(function(p){return memBusy(ev,p);});}
function inMatch(ev,m,pid){return [m.a,m.b].some(function(p){return ev.parts[p]&&ev.parts[p].members.indexOf(pid)>=0;});}
function pickWriter(ev,b,m){
  var lp=ev.prevLoser[b],cand=lp?ev.parts[lp].members.filter(function(p){return !inMatch(ev,m,p)&&!memBusy(ev,p);}):[];
  if(!cand.length)cand=ev.pids.filter(function(p){return !inMatch(ev,m,p)&&!memBusy(ev,p);});
  cand.sort(function(x,y){return (ev.writes[x]||0)-(ev.writes[y]||0);});
  return cand[0]||null;
}
function hasKO(ev){return ev.matches.some(function(m){return m.kind==='KO';});}
function fill(ev){
  var md=MD(ev);resolveKO(ev);
  if(ev.phase==='running'&&!hasKO(ev)){
    if(md.finals){
      if(!ev.groups2&&phaseDone(ev,1)){var adv=rankAcross(ev,1).slice(0,ev.plan.A).map(function(r){return r.id;});ev.groups2=snake(adv,ev.plan.K/2);addRR(ev,ev.groups2,2,'Zwischenrunde');}
      else if(ev.groups2&&phaseDone(ev,2)){buildKO(ev,rankAcross(ev,2).slice(0,ev.plan.K).map(function(r){return r.id;}),true);}
    }else if(phaseDone(ev,1)){buildKO(ev,rankAcross(ev,1).slice(0,ev.plan.q).map(function(r){return r.id;}),false);}
  }
  resolveKO(ev);
  for(var b=0;b<ev.boards.length;b++){
    if(ev.boards[b])continue;
    var c=ev.matches.filter(function(m){return m.status==='wait'&&m.a&&m.b&&!partBusy(ev,m.a)&&!partBusy(ev,m.b);});
    var lp=ev.prevLoser[b];if(lp){var c2=c.filter(function(m){return m.a!==lp&&m.b!==lp;});if(c2.length)c=c2;}
    c.sort(function(x,y){var rx=Math.max(ev.last[x.a]||0,ev.last[x.b]||0),ry=Math.max(ev.last[y.a]||0,ev.last[y.b]||0);return rx-ry||x.order-y.order;});
    if(c[0]){var m=c[0];m.status='live';m.board=b;ev.boards[b]=m.id;newLeg(m);m.writer=pickWriter(ev,b,m);if(m.writer)ev.writes[m.writer]=(ev.writes[m.writer]||0)+1;}
  }
  if(hasKO(ev)&&ev.matches.every(function(m){return m.status==='done';})){ev.phase='done';ev.summary=evSummary(ev);}
}
// Kurzfassung eines fertigen Abends (für das Grafik-Studio / Instagram): Podium und Bestwerte
function evSummary(ev){try{
  var pd=podium(ev).slice(0,4).map(function(x){return{place:x.place,name:partN(ev,x.part),money:x.money||0,pts:x.pts||0};});
  var st=stats([ev]),ids=Object.keys(st);
  function top(f,low){var b=null;ids.forEach(function(id){var v=f(st[id]);if(v&&(!b||(low?v<b.v:v>b.v)))b={name:pn(+id),v:v};});return b;}
  var all=podium(ev).map(function(x){return{name:partN(ev,x.part),place:x.place,pts:x.pts||0};});
  return{date:ev.date,mode:ev.mode,n:Object.keys(ev.parts).length,np:(ev.pids||[]).length,podium:pd,all:all,
    avg:top(function(x){return Math.round(avgOf(x)*100)/100;}),t180:top(function(x){return x.t180;}),hf:top(function(x){return x.hf;}),best:top(function(x){return x.best;},true),
    n180:ids.reduce(function(a,id){return a+(st[id].t180||0);},0)};
}catch(e){return null;}}
function newLeg(m){m.legs.push({starter:m.legs.length%2,visits:[],winner:null});}
function thrower(ev,m,leg,side){var mem=ev.parts[side===0?m.a:m.b].members,k=leg.visits.filter(function(v){return v.p===side;}).length,li=m.legs.indexOf(leg);return mem[(k+li)%mem.length];}
function restX(ev,m,leg,side){var r=ev.parts[side===0?m.a:m.b].start;leg.visits.forEach(function(v){if(v.p===side&&!v.bust)r-=v.score;});return r;}
function isIn(ev,leg,side){return !MD(ev).di||leg.visits.some(function(v){return v.p===side&&!v.bust&&v.score>0;});}
function minDarts(r){var c=CO[r];return c?c.length:4;}

/* --- x01 --- */
function submitX(ev,b,val){
  var m=byId(ev,ev.boards[b]);if(!m||m.over)return '';
  var s=+val;if(val===''||isNaN(s))return '';
  if(s>180||!VALID[s])return 'err:'+s+' ist mit drei Darts nicht möglich.';
  var leg=curLeg(m),p=turn(leg),r=restX(ev,m,leg,p),who=thrower(ev,m,leg,p);
  if(s===r&&CO[r]){ev.ask[b]={p:p,score:s,min:minDarts(r),who:who};return '';}
  var bust=s>r||r-s===1||s===r;
  leg.visits.push({p:p,who:who,score:s,bust:bust,darts:3});
  if(!bust)hl(ev,m,leg,who,s);
  return bust?'Überworfen. '+pn(who)+' bleibt auf '+r+'.':'';
}
function checkoutX(ev,b,darts){
  var m=byId(ev,ev.boards[b]),a=ev.ask[b];if(!m||!a)return '';
  var leg=curLeg(m);leg.visits.push({p:a.p,who:a.who,score:a.score,bust:false,darts:darts,co:true});ev.ask[b]=null;
  var ld=sum(leg.visits.filter(function(v){return v.p===a.p;}).map(function(v){return v.darts;}));
  var pt=ev.parts[a.p===0?m.a:m.b];hl(ev,m,leg,a.who,a.score,true,ld,pt.members.length===1&&pt.start===501);
  return winLeg(ev,m,leg,a.p,ld);
}
function winLeg(ev,m,leg,side,ld){leg.winner=side;if(legsWon(m,side)>=m.ft){m.over=true;m.winner=side;return '';}newLeg(m);return 'Leg an '+partN(ev,side===0?m.a:m.b)+' ('+ld+' Darts).';}
/* --- Cricket --- */
function cState(m,leg,extra){var st={mk:[{},{}],pts:[0,0]},vs=leg.visits.slice();if(extra)vs.push(extra);vs.forEach(function(v){(v.dl||[]).forEach(function(d){cApply(st,v.p,d);});});return st;}
function cApply(st,side,d){if(!d.n)return;var c=st.mk[side][d.n]||0,nc=c+d.m;if(nc>3){if((st.mk[1-side][d.n]||0)<3)st.pts[side]+=(nc-3)*d.n;nc=3;}st.mk[side][d.n]=nc;}
function cClosed(st,side){return CNUM.every(function(n){return(st.mk[side][n]||0)>=3;});}
function cDart(ev,b,n,mult){
  var m=byId(ev,ev.boards[b]);if(!m||m.over)return '';
  var leg=curLeg(m),p=turn(leg),cur=ev.cin[b];
  if(n===25&&mult===3)return 'err:Ein Triple-Bull gibt es nicht.';
  cur.push({n:n,m:n?mult:0});
  var st=cState(m,leg,{p:p,dl:cur});
  if(cClosed(st,p)&&st.pts[p]>=st.pts[1-p])return cEnd(ev,b,true);
  if(cur.length===3)return cEnd(ev,b,false);
  return '';
}
function cEnd(ev,b,won){
  var m=byId(ev,ev.boards[b]);if(!m||m.over)return '';
  var leg=curLeg(m),p=turn(leg),cur=ev.cin[b],who=thrower(ev,m,leg,p),marks=sum(cur.map(function(d){return d.m;}));
  leg.visits.push({p:p,who:who,dl:cur.slice(),darts:won?cur.length:3,marks:marks});ev.cin[b]=[];
  if(marks>=6)ev.hl.unshift({t:marks+' Marks',who:who,v:leg.visits[leg.visits.length-1]});
  if(won){var ld=sum(leg.visits.filter(function(v){return v.p===p;}).map(function(v){return v.darts;}));return winLeg(ev,m,leg,p,ld);}
  return '';
}
function undo(ev,b){
  var m=byId(ev,ev.boards[b]);if(!m)return '';
  if(ev.ask[b]){ev.ask[b]=null;return '';}
  if(ev.cin[b].length){ev.cin[b].pop();return 'Letzten Dart zurückgenommen.';}
  var leg=curLeg(m);if(!leg.visits.length&&m.legs.length>1){m.legs.pop();leg=curLeg(m);}
  if(!leg.visits.length)return '';
  var v=leg.visits.pop();if(leg.winner!=null){leg.winner=null;m.over=false;m.winner=null;}
  ev.hl=ev.hl.filter(function(h){return h.v!==v;});
  return 'Letzte Aufnahme zurückgenommen.';
}
function commit(ev,b){
  var m=byId(ev,ev.boards[b]);if(!m||!m.over)return;
  m.status='done';m.board=null;ev.boards[b]=null;ev.prevLoser[b]=loserPart(m);ev.tick++;ev.last[m.a]=ev.tick;ev.last[m.b]=ev.tick;
  fill(ev);
}
function hl(ev,m,leg,who,s,co,ld,single){
  var v=leg.visits[leg.visits.length-1];
  if(s===180)ev.hl.unshift({t:'180',who:who,v:v});else if(s>=171)ev.hl.unshift({t:String(s),who:who,v:v});
  if(co&&s>=100)ev.hl.unshift({t:s+' Finish',who:who,v:v,big:true});
  if(co&&single&&ld<=18)ev.hl.unshift({t:ld+' Darts',who:who,v:v,leg:true});
}

/* ================= Platzierungen und Geld ================= */
function placements(ev){
  if(ev.phase!=='done')return null;
  var md=MD(ev),out={},n=Object.keys(ev.parts).length;
  function set(part,place){if(part&&!out[part])out[part]={place:place};}
  function st(name){return ev.matches.filter(function(m){return m.stage===name;});}
  var f=st('Finale')[0];set(winnerPart(f),1);set(loserPart(f),2);
  if(ev.plan&&ev.plan.dko){var lr=ev.matches.filter(function(m){return m.dk==='L';}),rs=lr.map(function(m){return m.dr;}),pl0=3;
    rs.filter(function(v,i){return rs.indexOf(v)===i;}).sort(function(a,b){return b-a;}).forEach(function(r){var l=lr.filter(function(m){return m.dr===r;}).map(loserPart).filter(function(p){return p&&!out[p];});l.forEach(function(p){set(p,pl0);});pl0+=l.length;});}
  else{
  var p3=st('Spiel um Platz 3')[0];if(p3){set(winnerPart(p3),3);set(loserPart(p3),4);}
  var p5=st('Spiel um Platz 5')[0];if(p5){set(winnerPart(p5),5);set(loserPart(p5),6);}
  st('Platz 5–8').forEach(function(m){set(loserPart(m),7);});
  var place=Object.keys(out).length+1;
  ['Viertelfinale','Achtelfinale','Sechzehntelfinale','Runde der letzten 64'].forEach(function(s){var l=st(s).map(loserPart).filter(function(p){return !out[p];});l.forEach(function(p){set(p,place);});place+=l.length;});
  [2,1].forEach(function(ph){if(ph===2&&!ev.groups2)return;var r=rankAcross(ev,ph).filter(function(x){return !out[x.id];});r.forEach(function(x,i){set(x.id,place+i);});place+=r.length;});
  }
  var prize=md.masters?payout(n*DAY_FEE,DAY_SPLIT):md.finals?payout(potFor(ev.season),FIN_SPLIT):[];
  var wins={};ev.matches.forEach(function(m){if(m.status==='done'){var w=winnerPart(m);wins[w]=(wins[w]||0)+1;}});
  Object.keys(out).forEach(function(k){var o=out[k],behind=Object.keys(out).filter(function(j){return out[j].place>o.place;}).length;
    o.pts=md.masters?PTS_START+PTS_BEHIND*behind+PTS_WIN*(wins[k]||0)+(PTS_BONUS[o.place]||0):0;o.money=prize[o.place-1]||0;});
  return out;
}
function podium(ev){var pc=placements(ev);if(!pc)return[];return Object.keys(pc).map(function(k){return{part:+k,place:pc[k].place,money:pc[k].money,pts:pc[k].pts};}).sort(function(a,b){return a.place-b.place;});}
function potFor(season){return sum(ARCHIVE.filter(function(e){return e.season===season&&MODES[e.mode].masters;}).map(function(e){return e.pids.length*POT_FEE;}));}

/* ================= Statistik ================= */
function blank(){return{ev:0,sp:0,w:0,sc:0,dt:0,t180:0,t171:0,hf:0,best:0,sl:0,mk:0,cd:0,m9:0};}
function stats(evs){
  var o={};function X(pid){return o[pid]||(o[pid]=blank());}
  evs.forEach(function(ev){
    var cr=MD(ev).kind==='cricket';ev.pids.forEach(function(p){X(p).ev++;});
    ev.matches.forEach(function(m){
      if(!m.a||!m.b)return;
      var single=ev.parts[m.a].members.length===1&&ev.parts[m.b].members.length===1,full=ev.parts[m.a].start===501&&ev.parts[m.b].start===501;
      if(m.status==='done')[0,1].forEach(function(s){ev.parts[s===0?m.a:m.b].members.forEach(function(p){var x=X(p);x.sp++;if(m.winner===s)x.w++;});});
      m.legs.forEach(function(l){var ld=[0,0];l.visits.forEach(function(v){
        var x=X(v.who);ld[v.p]+=v.darts;
        if(cr){x.mk+=v.marks;x.cd+=v.darts;if(v.marks===9)x.m9++;return;}
        x.dt+=v.darts;if(!v.bust){x.sc+=v.score;if(v.score===180)x.t180++;else if(v.score>=171)x.t171++;}
        if(v.co){if(v.score>x.hf)x.hf=v.score;if(single&&full){if(ld[v.p]<=18)x.sl++;if(!x.best||ld[v.p]<x.best)x.best=ld[v.p];}}
      });});
    });
  });
  return o;
}
function avgOf(x){return x&&x.dt?x.sc/x.dt*3:0;}
function mprOf(x){return x&&x.cd?x.mk/x.cd*3:0;}
function sideQ(ev,m,s){var sc=0,dt=0,mk=0;m.legs.forEach(function(l){l.visits.forEach(function(v){if(v.p!==s)return;dt+=v.darts;if(!v.bust)sc+=v.score||0;mk+=v.marks||0;});});
  if(!dt)return '–';return MD(ev).kind==='cricket'?(mk/dt*3).toFixed(2).replace('.',',')+' MPR':'Ø '+(sc/dt*3).toFixed(2).replace('.',',');}

/* Tiefe Statistik pro Spieler: nur Einzel, 501 */
var BUCK=[[0,39,'unter 40'],[40,59,'40–59'],[60,99,'60–99'],[100,139,'100+'],[140,179,'140+'],[180,180,'180']];
var LEGB=[[0,15,'bis 15'],[16,18,'16–18'],[19,21,'19–21'],[22,24,'22–24'],[25,27,'25–27'],[28,30,'28–30'],[31,99,'31+']];
function deep(evs){
  var o={};function X(p){return o[p]||(o[p]={hs:0,hw:0,bs:0,bw:0,dec:0,decw:0,cb:0,cbn:0,bk:[0,0,0,0,0,0],legs:[0,0,0,0,0,0,0],f9s:0,f9d:0,vals:[],fv:0,fc:0,form:[]});}
  evs.forEach(function(ev,ei){
    var per={};
    ev.matches.forEach(function(m){
      if(m.status!=='done'||!m.a||!m.b)return;var A=ev.parts[m.a],B=ev.parts[m.b];
      if(A.members.length!==1||B.members.length!==1||A.start!==501||B.start!==501||MD(ev).kind!=='x01')return;
      var ids=[A.members[0],B.members[0]],won=[0,0];
      m.legs.forEach(function(l,li){
        if(l.winner==null)return;
        [0,1].forEach(function(s){var x=X(ids[s]);
          if(l.starter===s){x.hs++;if(l.winner===s)x.hw++;}else{x.bs++;if(l.winner===s)x.bw++;}
          if(won[0]===m.ft-1&&won[1]===m.ft-1){x.dec++;if(l.winner===s)x.decw++;}
        });
        var rest=[501,501],cnt=[0,0],dts=[0,0];
        l.visits.forEach(function(v){var x=X(ids[v.p]);cnt[v.p]++;dts[v.p]+=v.darts;
          var sc=v.bust?0:v.score;for(var k=0;k<BUCK.length;k++)if(sc>=BUCK[k][0]&&sc<=BUCK[k][1]){x.bk[k]++;break;}
          x.vals.push(sc);if(cnt[v.p]<=3){x.f9s+=sc;x.f9d+=v.darts;}
          if(rest[v.p]<=40)x.fv++;if(v.co)x.fc++;
          if(!v.bust)rest[v.p]-=v.score;
          var pe=per[ids[v.p]]||(per[ids[v.p]]={s:0,d:0});pe.s+=sc;pe.d+=v.darts;
        });
        var wd=dts[l.winner];for(var k2=0;k2<LEGB.length;k2++)if(wd>=LEGB[k2][0]&&wd<=LEGB[k2][1]){X(ids[l.winner]).legs[k2]++;break;}
        won[l.winner]++;
      });
      var fl=m.legs[0].winner;[0,1].forEach(function(s){if(fl!==s){var x=X(ids[s]);x.cbn++;if(m.winner===s)x.cb++;}});
    });
    Object.keys(per).forEach(function(p){X(+p).form.push({ei:ei,d:ev.date,avg:per[p].s/per[p].d*3});});
  });
  Object.keys(o).forEach(function(k){var x=o[k],n=x.vals.length,mu=n?sum(x.vals)/n:0;x.sd=n?Math.sqrt(sum(x.vals.map(function(v){return(v-mu)*(v-mu);}))/n):0;
    x.hold=x.hs?x.hw/x.hs:null;x.brk=x.bs?x.bw/x.bs:null;x.decq=x.dec?x.decw/x.dec:null;x.f9=x.f9d?x.f9s/x.f9d*3:0;x.fin=x.fc?x.fv/x.fc:null;});
  return o;
}
/* CDA-Rating (Elo) über alle Einzel-Matches */
function ratings(evs){
  var R={},hist={};function g(p){return R[p]==null?1500:R[p];}
  evs.forEach(function(ev,ei){
    ev.matches.forEach(function(m){if(m.status!=='done'||!m.a||!m.b)return;var A=ev.parts[m.a],B=ev.parts[m.b];if(A.members.length!==1||B.members.length!==1)return;
      var a=A.members[0],b=B.members[0],ra=g(a),rb=g(b),ea=1/(1+Math.pow(10,(rb-ra)/400)),sa=m.winner===0?1:0,k=24;
      R[a]=ra+k*(sa-ea);R[b]=rb+k*((1-sa)-(1-ea));});
    ev.pids.forEach(function(p){(hist[p]||(hist[p]=[])).push({ei:ei,r:g(p)});});
  });
  return{R:R,hist:hist};
}
function mastersTable(evs){
  var R={};evs.filter(function(e){return MODES[e.mode].masters;}).forEach(function(ev){var pc=placements(ev);if(!pc)return;
    Object.keys(pc).forEach(function(part){var x=pc[part];ev.parts[part].members.forEach(function(pid){var r=R[pid]||(R[pid]={pid:pid,pts:0,all:0,list:[],n:0,wins:0,money:0,form:{}});r.list.push(x.pts);r.all+=x.pts;r.n++;r.money+=x.money;if(x.place===1)r.wins++;r.form[ev.date]=x.place;});});});
  Object.keys(R).forEach(function(k){var r=R[k];r.pts=sum(r.list.slice().sort(function(a,b){return b-a;}).slice(0,BEST_OF));});
  return R;
}

/* ================= Simulation (Demo) ================= */
function simVisit(ev,b){
  var m=byId(ev,ev.boards[b]);if(!m||m.over)return;m.started=true;
  var leg=curLeg(m),p=turn(leg),who=thrower(ev,m,leg,p),sk=pl(who).cur||pl(who).skill;
  if(MD(ev).kind==='cricket'){simCricket(ev,b,m,leg,p,sk);return;}
  var r=restX(ev,m,leg,p),s;
  if(MD(ev).di&&!isIn(ev,leg,p)){if(RNG()<.45+sk/250){s=Math.max(2,Math.round(sk*.6+gauss()*15));s=Math.min(s,r-2);while(s>0&&!VALID[s])s--;}else s=0;submitX(ev,b,String(s));return;}
  if(CO[r]){
    var ch=(r<=40?.3:r<=80?.1:r<=100?.05:r<=130?.008:.003)*Math.pow(sk/65,2);
    if(RNG()<ch){submitX(ev,b,String(r));if(ev.ask[b])checkoutX(ev,b,Math.max(ev.ask[b].min,rnd(ev.ask[b].min,3)));return;}
    if(r<=60){s=Math.max(0,r-2*rnd(1,Math.min(20,Math.floor(r/2))));if(r-s===1||!VALID[s])s=0;submitX(ev,b,String(s));return;}
  }
  var u=RNG();if(u<.006*Math.pow(sk/65,4)&&r>=182)s=180;else if(u<.009*Math.pow(sk/65,4)&&r>=179)s=[171,174,177][rnd(0,2)];else if(u<.06*Math.pow(sk/65,2))s=[140,140,135,125,121][rnd(0,4)];else if(u<.16*Math.pow(sk/65,2))s=[100,100,105,95,85][rnd(0,4)];else s=Math.round(sk*(.45+RNG()*1.0));
  s=Math.max(0,Math.min(180,s));if(r<=180)s=Math.min(s,r-2);while(s>0&&!VALID[s])s--;
  submitX(ev,b,String(Math.max(0,s)));
}
function simCricket(ev,b,m,leg,p,sk){
  for(var i=0;i<3;i++){
    var st=cState(m,leg,{p:p,dl:ev.cin[b]}),tgt=null;
    for(var k=0;k<CNUM.length;k++){var n=CNUM[k];if((st.mk[p][n]||0)<3){tgt=n;break;}}
    if(!tgt)tgt=CNUM.filter(function(n){return(st.mk[1-p][n]||0)<3;})[0]||20;
    var hit=RNG()<(tgt===25?.25:.42)+sk/300,mult=1;if(hit){var x=RNG();mult=tgt!==25&&x<.12+sk/700?3:x<.3?2:1;}
    var before=curLeg(m);cDart(ev,b,hit?tgt:0,mult);
    if(m.over||curLeg(m)!==before||!ev.cin[b].length)return;
  }
}
function noSim(){return S.live&&!(S.ev&&S.ev.test);}
function simMatch(ev,b){var g=0,m=byId(ev,ev.boards[b]);while(m&&!m.over&&g++<900)simVisit(ev,b);commit(ev,b);}
function simAll(ev){var g=0;while(ev.phase==='running'&&g++<4000){var any=false;for(var b=0;b<ev.boards.length;b++)if(ev.boards[b]){simMatch(ev,b);any=true;}if(!any){fill(ev);if(!ev.boards.some(Boolean))break;}}}

/* ================= Beispiel-Saison nach Rotation ================= */
var ARCHIVE=[];
function pickPlayers(n,wf){var pool=PLAYERS.map(function(p){return{id:p.id,w:wf(p)};}).filter(function(x){return x.w>0;}),out=[];
  while(out.length<n&&pool.length){var tot=sum(pool.map(function(x){return x.w;})),r=RNG()*tot,k=0;while(k<pool.length-1&&(r-=pool[k].w)>0)k++;out.push(pool[k].id);pool.splice(k,1);}return out;}
function simSeason(season,limit){
  PLAYERS.forEach(function(p){p.trend=(RNG()-.4)*8;});
  var entries=cal(season),w=0;
  entries.forEach(function(en){
    if(limit!=null&&w>=limit)return;
    if(en.mode==='finals'){
      var mt=mastersTable(ARCHIVE.filter(function(e){return e.season===season;})),q=Object.keys(mt).map(Number).filter(function(id){return mt[id].n>=MIN_QUALI&&!pl(id).guest;}).sort(function(a,b){return mt[b].pts-mt[a].pts;}).slice(0,MAX_FINALS);
      var fe=newEv('finals',en.date,VENUES_TSV,season);fe.venueName='TSV Dinkelscherben';
      PLAYERS.forEach(function(p){p.cur=Math.max(30,p.skill+p.trend+gauss()*2.5);});
      start(fe,q);simAll(fe);ARCHIVE.push(fe);return;
    }
    var mode=en.mode,md=MODES[mode],ev=newEv(mode,en.date,['pc','pc'],season);
    PLAYERS.forEach(function(p){p.cur=Math.max(30,p.skill+p.trend*(w/50)+gauss()*2.5);});
    var pids;
    if(mode==='friend'){pids=pickPlayers(rnd(8,11),function(p){return p.guest?0:p.att;});PLAYERS.forEach(function(g){if(g.guest&&g.by&&pids.indexOf(g.by)>=0&&RNG()<.8)pids.push(g.id);});}
    else pids=pickPlayers(md.masters?rnd(12,18):rnd(8,14),function(p){return p.guest?p.att*.6:p.att*(md.masters?1.2:1);});
    start(ev,pids);simAll(ev);ARCHIVE.push(ev);w++;
  });
  PLAYERS.forEach(function(p){p.cur=null;});
}
var VENUES_TSV=['tablet','tablet','tablet','tablet','tablet','tablet'];
simSeason('2026',null);

/* ================= Oberfläche ================= */
RNG=Math.random;
var VENUES={bistro:{name:'Bismarck Bistro',boards:['pc','pc'],note:'Bismarckstraße 7, 86159 Augsburg · 2 Boards · je ein PC'},sergios:{name:'Sergio\'s',boards:['pc','pc','pc','pc','pc'],note:'Meisenweg 25, 86156 Augsburg · 5 Boards · je ein PC'},tsv:{name:'TSV Dinkelscherben',boards:['tablet','tablet','tablet','tablet','tablet','tablet'],note:'Burggasse 50, 86424 Dinkelscherben · 6 Boards · 6 Tablets'}};
var S={fmt:'groups',legs:{lvl:0,auto:true,target:'23:00',fh:7,custom:null},view:SITE?'season':'gate',role:null,me:null,login:{},mode:'m501',season:'2026',showAll:false,venue:'bistro',boards:['pc','pc'],checked:{},ev:null,input:{},msg:{},sort:{k:'avg',d:-1},duel:[1,3],pid:1,back:'season'};
[1,2,3,4,11,12,15,10,20,7,26].forEach(function(i){S.checked[i]=true;});
var TONIGHT='2027-01-14';
function newTonight(){S.ev=newEv(S.mode,TONIGHT,S.boards);S.input={};S.msg={};}
newTonight();
(function(){var ev=S.ev,ck=Object.keys(S.checked).map(Number);ev.legs=chooseLegs(MD(ev),ck.length).L;start(ev,ck);for(var i=0;i<3;i++){simMatch(ev,0);simMatch(ev,1);}for(var j=0;j<9;j++)simVisit(ev,0);})();

var SIM_EV=S.ev;
var V=DOC.getElementById('view');
function nb(){return S.ev.phase==='checkin'?S.boards.length:S.ev.boards.length;}
function canSee(v){
  if(SITE)return v==='season'||v==='profile';
  if(v==='gate')return true;
  if(!S.role)return false;
  if(S.role==='spec')return /^s-/.test(v)||v==='profile';
  if(S.role==='lead')return true;
  return v===S.role;
}
function renderTabs(){
  if(SITE)return;
  var t;
  if(!S.role)t=[];
  else if(S.role==='spec')t=[['s-live','Live'],['s-table','Tabelle'],['s-stats','Statistik'],['gate','← Auswahl']];
  else if(S.role==='lead'){t=[['lead','Turnierleitung']];for(var b=0;b<nb();b++)t.push(['b'+b,'Board '+(b+1)]);t.push(['s-live','Live'],['season','Saison'],['logout','Abmelden']);}
  else t=[[S.role,'Board '+(+S.role.slice(1)+1)],['logout','Abmelden']];
  var cur=S.view==='profile'?S.back:S.view;
  DOC.getElementById('tabs').innerHTML=t.map(function(x){return '<button role="tab" data-tab="'+x[0]+'" aria-selected="'+(cur===x[0])+'">'+x[1]+'</button>';}).join('');
  DOC.getElementById('venue-label').textContent=!S.role?'Competition auswählen oder anmelden':(S.role==='spec'?'Zuschauer · ':S.role==='lead'?'Turnierleitung · ':'Board-PC · ')+(S.ev.phase==='checkin'?VENUES[S.venue]?VENUES[S.venue].name:'Eigener Spielort':S.ev.venueName||'Bismarck Bistro');
}
// Besucherzahlen ohne Cookies (nur Seite + Tag), nur auf der echten Spielbetrieb-Seite
var HITS={};function hit(p){if(SITE||HITS[p]||location.protocol==='file:'||navigator.webdriver)return;HITS[p]=1;try{fetch(SBU+'/rest/v1/rpc/cda_hit',{method:'POST',keepalive:true,headers:{apikey:SBK,'Content-Type':'application/json'},body:JSON.stringify({p_page:p})}).catch(function(){});}catch(e){}}
function render(){
  var v0=S.view;hit('spielbetrieb');if(S.view==='live'||S.view==='s-live')hit('live');if(S.view==='lead')hit('leitung');if(/^b\d$/.test(S.view))hit('board');
  if(!canSee(S.view))S.view=SITE?'season':'gate';
  renderTabs();if(!SITE)syncBadge();if(S.view==='gate')gateLoad();var ev=S.ev,v=S.view;
  if(v==='gate')V.innerHTML=viewGate();
  else if(v==='lead')V.innerHTML=ev.phase==='checkin'?viewCheckin():viewLead();
  else if(v==='live'||v==='s-live')V.innerHTML=viewSpecLive();
  else if(v==='s-table')V.innerHTML=viewSpecTable();
  else if(v==='s-stats')V.innerHTML=viewSpecStats();
  else if(v==='season')V.innerHTML=viewSeason();
  else if(v==='profile')V.innerHTML=viewProfile(S.pid);
  else V.innerHTML=viewBoard(+v.slice(1));
  try{if(!SITE)sessionStorage.setItem('cda-sb',JSON.stringify({role:S.role,view:S.view,me:S.me}));}catch(e){}
}
/* --- Auswahl / Anmeldung --- */
function evLabel(ev){var md=MD(ev);return md.name+' · '+wdS(ev.date)+' '+dshort(ev.date);}
function realNext(n){var t=realToday(),out=[],d=new Date(t+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);
  for(var i=0;out.length<n&&i<120;i++,d.setUTCDate(d.getUTCDate()+1)){var iso=d.toISOString().slice(0,10),md=iso.slice(5),dw=d.getUTCDay();
    if(iso<'2027-01-07'){if(dw===4&&md<'12-23'&&md>='01-07')out.push({date:iso,mode:'c501',alt:true});}
    else{var c=cal(iso.slice(0,4)).filter(function(x){return x.date===iso;})[0];if(c)out.push(c);}}
  return out;}
function viewGate(){
  var ev=LIVEAUTH?(SV.gate&&SV.gate.state):S.ev;
  var nx=LIVEAUTH?realNext(4):cal(TONIGHT.slice(0,4)).concat(cal(String(+TONIGHT.slice(0,4)+1))).filter(function(x){return x.date>TONIGHT;}).slice(0,4);
  var nextL='<h3 style="margin-top:18px">Nächste Termine</h3><ul class="gnext">'+nx.map(function(x){var m=MODES[x.mode];return '<li class="'+(!x.alt&&(m.masters||m.finals)?'ms':'')+'"><span>'+wdS(x.date)+' '+dshort(x.date)+'</span><b>'+(x.alt?'Competition':m.name)+'</b>'+(x.note?'<i>'+x.note+'</i>':'')+'</li>';}).join('')+'</ul>';
  var card;
  if(!ev){card='<div class="gev gnone"><b>Heute keine Competition</b><span class="muted">'+(SV.gateLoaded?'Sobald die Turnierleitung einen Abend startet, erscheint er hier.':'Wird geladen …')+'</span></div>'+
      '<p class="cap">Neugierig, wie ein Abend aussieht? <button class="btn small" data-act="watchsim">Simulation ansehen</button></p>';}
  else{var md=MD(ev),done=ev.matches?ev.matches.filter(function(m){return m.status==='done';}).length:0,total=ev.plan?ev.plan.total:0;
    var live=ev.phase==='running'&&!ev.archived,st=ev.phase==='checkin'?'<span class="gst">Anmeldung läuft · Start 20 Uhr</span>':live?'<span class="gst live"><i></i>Läuft gerade</span>':'<span class="gst">Beendet</span>';
    card='<button class="gev" data-act="watch"><span class="gtop">'+st+'<span class="muted">'+esc(ev.venueName||'Bismarck Bistro')+(ev.test?' · Testabend':'')+'</span></span><b>'+md.name+'</b><span class="muted">'+wdS(ev.date)+' '+dshort(ev.date)+ev.date.slice(0,4)+' · '+md.sub+(ev.phase!=='checkin'?' · '+Object.keys(ev.parts).length+(md.doubles?' Teams':' Spieler')+' · '+done+' von '+total+' Matches':'')+'</span>'+
      (ev.phase!=='checkin'?'<span class="progress"><i style="width:'+Math.round(done/Math.max(1,total)*100)+'%"></i></span>':'')+'<span class="gopen">Als Spieler oder Zuschauer öffnen →</span></button>'+
      '<p class="cap">Live-Ansicht der Boards, laufende Tabelle, K.-o.-Runde und alle Zahlen des Abends. Ohne Anmeldung.</p>';}
  var boards=ev?(ev.phase==='checkin'?S.boards:ev.boards):S.boards,opts='<option value="lead">Turnierleitung (alles)</option>'+[0,1,2,3,4,5].map(function(b){return '<option value="b'+b+'">Board '+(b+1)+(b<boards.length?' · heute im Einsatz':'')+'</option>';}).join('');
  return '<div class="gate">'+
    '<section class="panel gcard"><h3>Laufende Competition</h3>'+card+nextL+'</section>'+
    '<section class="panel gcard"><h3>Turnierleitung &amp; Boards</h3><form id="loginform" class="glog" autocomplete="off">'+
      '<label for="lg-role">Anmelden als</label><select id="lg-role">'+opts+'</select>'+
      '<label for="lg-code">Passwort</label><input id="lg-code" type="password" autocomplete="current-password" placeholder="Passwort eingeben">'+
      (S.login.err?'<p class="gerr">'+S.login.err+'</p>':'')+
      '<button class="btn primary" type="submit">Anmelden</button></form>'+
      '<p class="cap">Die Turnierleitung meldet Spieler an, startet den Abend und sieht alle Boards. Ein Board-PC sieht nur sein eigenes Board zum Schreiben.</p>'+
      (LIVEAUTH?'<p class="cap">Ein Board-PC bleibt angemeldet, bis jemand auf „Abmelden“ tippt. Passwort vergessen? Bei der Turnierleitung melden.</p>':'<p class="cap demo">Vorschau: Hier reicht der Code <b>cda</b>. Auf der Website gelten die echten Passwörter.</p>')+'</section></div>';
}
/* --- Zuschauer / Spieler --- */
function hasMe(ev,partId){var p=ev.parts[partId];return !!(p&&S.me&&p.members.indexOf(S.me)>=0);}
function meBox(ev){
  if(ev.phase==='checkin')return '';
  var ids=[];Object.keys(ev.parts).forEach(function(k){ev.parts[k].members.forEach(function(p){ids.push(p);});});
  ids.sort(function(a,b){return pn(a).localeCompare(pn(b),'de');});
  var sel='<label for="me" class="muted">Ich spiele mit:</label><select id="me" data-me="1"><option value="">– Name wählen –</option>'+ids.map(function(id){return '<option value="'+id+'"'+(S.me===id?' selected':'')+'>'+esc(pn(id))+'</option>';}).join('')+'</select>';
  var info='';
  if(S.me&&ids.indexOf(S.me)>=0){
    var b=-1;ev.boards.forEach(function(id,i){var m=byId(ev,id);if(m&&(hasMe(ev,m.a)||hasMe(ev,m.b)))b=i;});
    var wait=ev.matches.filter(function(m){return m.status==='wait';}).sort(function(x,y){return x.order-y.order;}),pos=-1,wm=null;
    wait.forEach(function(m,i){if(pos<0&&(hasMe(ev,m.a)||hasMe(ev,m.b))){pos=i;wm=m;}});
    var wr=-1;ev.boards.forEach(function(id,i){var m=byId(ev,id);if(m&&m.writer===S.me)wr=i;});
    if(b>=0){var cm=byId(ev,ev.boards[b]);info='<b class="mnow">Du spielst gerade an Board '+(b+1)+'</b> gegen '+partH(ev,hasMe(ev,cm.a)?cm.b:cm.a)+'.';}
    else if(wm)info='Dein nächstes Match: gegen '+partH(ev,hasMe(ev,wm.a)?wm.b:wm.a)+' · '+(pos===0?'<b>als Nächstes dran</b>':'noch '+pos+' Match'+(pos>1?'es':'')+' davor');
    else info=ev.phase==='done'?'Der Abend ist beendet.':'Gerade kein offenes Match für dich.';
    if(wr>=0)info+=' · <b class="mwr">✎ Du schreibst an Board '+(wr+1)+'</b>';
  }
  return '<div class="mebox">'+sel+(info?'<span>'+info+'</span>':'')+'</div>';
}
function liveDot(ev){return ev.phase==='running'?'<span class="gst live"><i></i>Live</span>':'';}
function viewSpecLive(){
  var ev=S.ev;
  if(ev.phase==='checkin')return '<div class="panel idle"><div class="big-n">Heute 20 Uhr</div><p class="muted" style="margin:0">'+MODES[S.mode].name+' · '+MODES[S.mode].sub+'. Sobald es losgeht, siehst du hier live, was auf den Boards passiert.</p></div>';
  var recent=ev.matches.filter(function(m){return m.status==='done';}).slice(-5).reverse();
  return '<div class="grid" style="gap:20px">'+modeBar(ev)+meBox(ev)+(ev.phase==='done'?'<div class="grid g2"><section class="panel">'+recap(ev)+'</section><section class="panel"><h3>Siegerehrung</h3>'+ceremonyList(ev,podium(ev))+'</section></div>':'')+
    '<div class="grid '+(ev.boards.length>2?'g3':'g2')+'">'+ev.boards.map(function(_,b){return boardCard(ev,b);}).join('')+'</div>'+
    '<div class="grid g2"><section class="panel"><h3>Als Nächstes</h3>'+queue(ev,4)+'<h3 style="margin-top:16px">Zuletzt gespielt</h3>'+(recent.length?'<ul class="mlist">'+recent.map(function(m){return mItem(ev,m);}).join('')+'</ul>':'<p class="muted" style="margin:0">Noch kein Match beendet.</p>')+'</section>'+
    '<section class="panel"><h3>Highlights des Abends</h3>'+hlList(ev)+'</section></div></div>';
}
function viewSpecTable(){
  var ev=S.ev;if(ev.phase==='checkin')return viewSpecLive();
  var done=ev.matches.filter(function(m){return m.status==='done';}).length;
  return '<div class="grid" style="gap:20px">'+modeBar(ev)+meBox(ev)+
    '<section class="panel"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Laufende Tabelle</h2>'+liveDot(ev)+'</div><span class="muted num">'+done+' von '+ev.plan.total+' Matches gespielt · '+ev.plan.txt+'</span><div class="progress"><i style="width:'+Math.round(done/ev.plan.total*100)+'%"></i></div></section>'+
    (ev.phase==='done'?'<section class="panel"><h3>Endstand</h3>'+ceremonyList(ev,podium(ev))+'</section>':'')+
    '<div class="grid g3">'+groupTables(ev)+'</div><section class="panel"><h3>K.-o.-Runde</h3>'+koList(ev)+'</section></div>';
}
function viewSpecStats(){
  var ev=S.ev;if(ev.phase==='checkin')return viewSpecLive();
  return '<div class="grid" style="gap:20px">'+modeBar(ev)+
    '<section class="panel"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Statistik heute</h2>'+liveDot(ev)+'</div><div class="tbl-wrap" style="margin-top:10px">'+statTable([ev],MD(ev).kind==='cricket')+'</div></section>'+
    '<div class="grid g2"><section class="panel"><h3>Highlights des Abends</h3>'+hlList(ev)+'</section><section class="panel"><h3>Saison</h3><p class="muted" style="margin:0 0 12px">Rangliste, Spielerprofile und alle Saisonstatistiken stehen auf der Homepage.</p><a class="btn small" href="index.html#masters">CDA Masters auf der Homepage</a></section></div></div>';
}
function flag(md){return md.finals?'<span class="flag ms-on">Saisonfinale</span>':md.masters?'<span class="flag ms-on">zählt für Masters</span>':'<span class="flag ms-off">Competition</span>';}
function modeBar(ev){var md=MD(ev);return '<div class="modebar"><b>'+md.name+'</b><span>'+md.sub+' · '+wdS(ev.date)+' '+dshort(ev.date)+' · '+(ev.venueName||'Bismarck Bistro')+' · '+ev.boards.length+' Boards</span>'+flag(md)+'</div>';}

function viewCheckin(){
  var ids=ckPlayers().filter(function(p){return S.checked[p.id];}).map(function(p){return p.id;}),md=MODES[S.mode];
  var nParts=md.doubles?Math.floor(ids.length/2):ids.length,LG=chooseLegs(md,nParts),p=makePlan(nParts,S.mode,S.boards.length,LG.L);
  var modes=Object.keys(MODES).map(function(k){var x=MODES[k];return '<button class="mode" data-act="mode" data-m="'+k+'" aria-pressed="'+(S.mode===k)+'">'+flag(x)+'<b>'+x.name+'</b><span class="ms">'+x.sub+(calMode(TONIGHT)===k?' · laut Plan heute':'')+'</span><p>'+x.desc+'</p></button>';}).join('');
  var mt=mastersTable(ARCHIVE.filter(function(e){return e.season===CUR_SEASON;}));
  var chips=ckPlayers().map(function(x){var on=!!S.checked[x.id],q=mt[x.id]?mt[x.id].n:0;return '<button class="chip" data-act="toggle" data-id="'+x.id+'" aria-pressed="'+on+'"><span class="box" aria-hidden="true">'+(on?'✓':'')+'</span><span>'+esc(x.name.replace(' (Gast)',''))+tmTag(x.team)+'</span>'+(x.guest?'<small>'+(x.by?'Gast von '+esc(pn(x.by).split(' ')[0]):'Gast')+'</small>':md.finals?'<small style="color:'+(q>=MIN_QUALI?'var(--green-ink)':'var(--muted)')+'">'+q+'/'+MIN_QUALI+'</small>':'')+'</button>';}).join('');
  var vb=Object.keys(VENUES).map(function(k){return '<button data-act="venue" data-v="'+k+'" aria-pressed="'+(S.venue===k)+'">'+VENUES[k].name+'<small>'+VENUES[k].note+'</small></button>';}).join('');
  var bt=S.boards.map(function(t,i){return '<button data-act="btype" data-i="'+i+'">Board '+(i+1)+' <span class="t-'+t+'">'+(t==='pc'?'PC':'Tablet')+'</span></button>';}).join('');
  var money='';
  if(md.masters&&p){var pr=payout(nParts*DAY_FEE,DAY_SPLIT);money='<div class="money"><div><b>'+eur(nParts*FEE)+'</b><span>Startgeld gesamt</span></div><div><b>'+eur(nParts*DAY_FEE)+'</b><span>Preisgeld heute</span></div><div><b>+'+eur(nParts*POT_FEE)+'</b><span>in den Pott</span></div></div><p class="muted" style="margin:-6px 0 14px;font-size:.85rem">Heute: 1. '+eur(pr[0])+' · 2. '+eur(pr[1])+' · 3. '+eur(pr[2])+' (50 / 30 / 20 %)</p><p class="muted" style="margin:-8px 0 14px;font-size:.85rem">Masters-Punkte: 5 fürs Mitspielen, 2 pro Spieler dahinter, 1 pro Matchsieg, Bonus +10/+6/+3 für die Top 3. Der Sieger heute bekommt rund '+(PTS_START+PTS_BEHIND*(nParts-1)+PTS_BONUS[1]+Math.ceil(Math.log2(nParts))+2)+' Punkte.</p>';}
  if(md.finals){var pot=potFor(CUR_SEASON),fp=payout(pot,FIN_SPLIT);money='<div class="money"><div><b>'+eur(pot)+'</b><span>Masters-Pott</span></div><div><b>'+eur(fp[0])+'</b><span>Sieger</span></div><div><b>'+fp.length+'</b><span>Plätze mit Geld</span></div></div><p class="muted" style="margin:-6px 0 14px;font-size:.85rem">'+fp.map(function(x,i){return (i+1)+'. '+eur(x);}).join(' · ')+'</p>';}
  var plan=p?('<div class="big-n num">'+ids.length+'</div><p class="muted" style="margin:2px 0 14px">Spieler eingecheckt'+(md.doubles?' · ergibt '+nParts+' Doppel':'')+'</p>'+
    (p.warn&&!S.legs.auto&&LG.lvl===0?'<p class="warn">Für '+S.boards.length+' Boards sind das viele Teilnehmer. Legs kürzen oder mehr Boards einplanen. <button class="btn small" data-act="legauto">Legs automatisch kürzen</button></p>':'')+money+
    fmtBox(md,nParts,LG)+'<dl><dt>Modus</dt><dd>'+md.name+' · '+md.sub+'</dd><dt>Format</dt><dd>'+p.txt+'</dd>'+(p.dko||p.sko?'':'<dt>'+(md.finals?'Vorrunde':'Gruppen')+'</dt><dd>'+p.sizes.length+' Gruppen ('+p.sizes.join(', ')+')</dd>')+'<dt>Legs</dt><dd>'+legTxt(md,LG.L,p)+'</dd><dt>Matches</dt><dd class="num">'+p.total+'</dd><dt>Ende ca.</dt><dd class="num">'+(md.finals?Math.floor(p.dur/60)+' h '+(p.dur%60)+' min Spielzeit':clock(p.dur)+' Uhr')+' <span class="muted">('+S.boards.length+' Boards)</span></dd></dl>'+
    (md.finals&&S.venue!=='tsv'?'<p class="warn">Die Finals sind beim TSV Dinkelscherben geplant. Spielort oben umstellen.</p>':'')+
    legBox(md,LG,p)+venueTip(md,nParts,LG)+testBox()+'<button class="btn primary" data-act="start">Auslosen und starten</button>'):'<p class="muted">Mindestens '+(md.finals?8:md.doubles?6:3)+' Spieler einchecken.</p>';
  return '<div class="grid" style="gap:16px">'+
    '<section class="panel setup"><h2>Spielort und Boards</h2><div class="vpre">'+vb+'</div>'+
      '<div class="row" style="gap:20px"><div class="bcount"><button data-act="bminus" aria-label="Ein Board weniger">−</button><b class="num">'+S.boards.length+'</b><button data-act="bplus" aria-label="Ein Board mehr">+</button><span class="muted">Boards</span></div><span class="muted" style="font-size:.85rem">Pro Board antippen: wird an einem PC (Tastatur) oder an einem Tablet (Touch) geschrieben?</span></div><div class="btypes">'+bt+'</div></section>'+
    '<section class="panel"><h2>Was spielen wir heute?</h2><div class="modes">'+modes+'</div></section>'+
    sbPanel()+
    '<div class="grid g2"><section class="panel"><h2>Check-in</h2><p class="muted" style="margin:0 0 10px">Wer heute mitspielt, antippen.'+(md.finals?' Die Zahl zeigt die Masters-Abende, ab '+MIN_QUALI+' ist man qualifiziert.':' Gäste mit Vornamen anlegen.')+'</p>'+
      '<div class="selall"><button class="btn small" data-act="selq">'+(md.finals?'Alle Qualifizierten':'Alle')+'</button><button class="btn small" data-act="selnone">Keine</button></div><div class="players">'+chips+'</div>'+
      '<form class="add" id="addform"><label for="guest" style="position:absolute;left:-9999px">Neuer Gast</label><input id="guest" placeholder="Neuer Gast: Vor- und Nachname" autocomplete="off"><label for="guestby" style="position:absolute;left:-9999px">Mitgebracht von</label><select id="guestby" class="bysel"><option value="">mitgebracht von …</option>'+ckPlayers().filter(function(x){return !x.guest;}).map(function(x){return '<option value="'+x.id+'">'+esc(x.name)+'</option>';}).join('')+'</select><button class="btn" type="submit">Hinzufügen</button></form><p class="cap">Gäste kurz fragen, ob ihr Name in Teilnehmerliste und Ergebnissen erscheinen darf. Wenn nicht, nur den Vornamen eintragen.</p></section>'+
    '<section class="panel plan"><h2>Vorschlag für heute</h2>'+plan+'</section></div></div>';
}
/* ===== Echtbetrieb: Abend in Supabase speichern und zwischen allen Geräten abgleichen ===== */
var SBU='https://qeevsqrmltewbtrnfrfm.supabase.co',SBK='sb_publishable_pwnzx63cque5lKZEVCe4mA_5SvBP8Yd';
var SV={rev:0,pending:[],busy:false,err:'',date:null,gate:null,gateLoaded:false};
S.live=false;S.testMode=false;
function hdr(auth){var h={apikey:SBK,'Content-Type':'application/json'};if(auth&&AUTH&&AUTH.access)h.Authorization='Bearer '+AUTH.access;return h;}
function evStatus(ev){return ev.archived?'done':ev.phase==='checkin'?'checkin':'running';}
function doneCount(ev){return ev&&ev.matches?ev.matches.filter(function(m){return m.status==='done';}).length:0;}
function ckPlayers(){return PLAYERS.filter(function(p){return S.live?!!p.real:!p.real;});}
function addReal(id,name,team,guest){if(pl(id))return;PLAYERS.push({id:id,name:name,team:team||'',guest:!!guest,skill:55,att:.5,by:null,real:true});
  var sp=PLAYERS.filter(function(q){return !q.real&&q.name===name;})[0];if(sp){if(PHOTO[sp.id])PHOTO[id]=PHOTO[sp.id];if(NICK[sp.id])NICK[id]=NICK[sp.id];}}
function ensurePlayers(ev){var r=(ev&&ev.roster)||{};Object.keys(r).forEach(function(k){addReal(+k,r[k].name,r[k].team,r[k].guest);});}
function guestName(n){return n.replace(/\s*\(Gast\)$/,'').trim().replace(/\s+/g,' ').split(' ').map(function(w){return w.charAt(0).toUpperCase()+w.slice(1);}).join(' ');}
function liveGuest(name,by){var n=guestName(name),h=0;for(var i=0;i<n.length;i++)h=(h*31+n.toLowerCase().charCodeAt(i))>>>0;
  var id=200000+h%799999;addReal(id,n+' (Gast)','',true);var p=pl(id);p.by=by||null;return p;}
function realPlayersLoad(){var R=['','I','II','III','IV'];
  return fetch(SBU+'/rest/v1/players?select=id,name,team&active=eq.true&order=name',{headers:hdr(false)}).then(function(r){return r.json();})
    .then(function(L){(L||[]).forEach(function(p){addReal(1000+p.id,p.name,R[p.team]||'',false);});});}
function liveFetch(force){
  return fetch(SBU+'/rest/v1/events?date=eq.'+SV.date+'&select=rev,state,status,test',{headers:hdr(false)}).then(function(r){return r.json();}).then(function(x){
    var row=x&&x[0];if(row&&row.state&&(force||row.rev!==SV.rev)){S.ev=row.state;ensurePlayers(S.ev);SV.rev=row.rev;}return row||null;});}
function enterLive(){
  S.live=true;SV.date=realToday();TONIGHT=SV.date;S.checked={};SV.err='';
  return realPlayersLoad().then(function(){return liveFetch(true);}).then(function(row){
    if(!row){var d=SV.date,m=d<'2027-01-07'?'c501':(calMode(d)||'c501');S.mode=MODES[m]?m:'c501';S.ev=newEv(S.mode,d,S.boards,d.slice(0,4));S.ev.test=d<'2027-01-07';SV.rev=0;}
    S.sb.state='idle';render();
  }).catch(function(){SV.err='Keine Verbindung zur Datenbank';render();});
}
function liveRun(b,run){
  if(!S.live||!(S.role==='lead'||/^b\d$/.test(S.role||'')))return run();
  var inp=b!=null?S.input[b]:undefined,before=JSON.stringify(S.ev),ph=S.ev.phase,dc=doneCount(S.ev);
  var res=run();
  if(JSON.stringify(S.ev)===before)return res;
  if(S.ev.phase==='checkin'&&!SV.rev)return res;   /* vor dem Start wird noch nichts gespeichert */
  var snap=!SV.rev||ph!==S.ev.phase||dc!==doneCount(S.ev)||!!S.ev.archived;
  SV.pending.push({snap:snap,fn:function(){var keep=b!=null?S.input[b]:undefined;if(b!=null)S.input[b]=inp;run();if(b!=null)S.input[b]=keep;}});
  flush();return res;
}
function flush(){
  if(SV.busy||!SV.pending.length)return;
  if(!AUTH||!AUTH.access){SV.err='Nicht angemeldet';render();return;}
  SV.busy=true;var n=SV.pending.length,snap=SV.pending.some(function(p){return p.snap;}),ev=S.ev,isStart=SV.rev===0;
  fetch(SBU+'/rest/v1/rpc/cda_save_event',{method:'POST',headers:hdr(true),body:JSON.stringify({p_date:ev.date,p_rev:SV.rev,p_state:ev,p_status:evStatus(ev),p_mode:ev.mode,p_venue:S.venue,p_test:!!ev.test,p_snapshot:snap})})
  .then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j&&j.message?j.message:'Fehler '+r.status);return j;});})
  .then(function(nr){
    if(nr>0){SV.rev=nr;SV.pending.splice(0,n);SV.busy=false;SV.err='';syncBadge();flush();return;}
    return liveFetch(true).then(function(){
      SV.busy=false;
      if(isStart){SV.pending=[];SV.err='Für heute läuft schon ein Abend. Er wird jetzt angezeigt.';render();return;}
      var ps=SV.pending;SV.pending=[];
      ps.forEach(function(p){var bf=JSON.stringify(S.ev);p.fn();if(JSON.stringify(S.ev)!==bf)SV.pending.push(p);});
      render();flush();});
  }).catch(function(x){SV.busy=false;
    if(/^Nicht erlaubt/.test(x.message)){ /* Datenbank lehnt ab (z. B. Board ändert fremdes Spiel): Änderung verwerfen, aktuellen Stand holen */
      SV.pending=[];SV.err=x.message.replace(/ \(.*\)$/,'');liveFetch(true).then(function(){render();setTimeout(function(){if(/^Nicht erlaubt/.test(SV.err)){SV.err='';syncBadge();}},6000);});return;}
    SV.err=/fetch/i.test(x.message)?'Keine Verbindung – wird gleich erneut gespeichert':x.message;syncBadge();setTimeout(flush,4000);});
}
function syncBadge(){var sy=DOC.getElementById('sync');if(!sy)return;sy.hidden=!S.live;if(!S.live)return;
  var st=SV.err?'err':(SV.busy||SV.pending.length)?'busy':'ok';sy.className='sync '+st;
  sy.textContent=st==='err'?'⚠ '+SV.err:st==='busy'?'Speichert …':S.role==='spec'?'● Live':'✓ Gespeichert';}
function testBox(){if(!S.live)return '';var forced=SV.date<'2027-01-07';
  return '<p class="cap">'+(forced?'<b>Testabend:</b> Bis zum Neustart am 07.01.2027 zählen Abende nicht für die Rangliste.':'<button class="btn small'+(S.testMode?' on':'')+'" data-act="testtoggle" aria-pressed="'+S.testMode+'">'+(S.testMode?'✓ ':'')+'Testabend (zählt nicht)</button>')+'</p>';}
/* Abgleich: alle paar Sekunden prüfen, ob ein anderes Gerät etwas gespeichert hat */
if(!SITE)setInterval(function(){
  if(!S.live||SV.busy||SV.pending.length||document.hidden||!SV.date)return;
  if(S.role==='spec'&&(SV.tick=(SV.tick||0)+1)%2)return;
  fetch(SBU+'/rest/v1/events?date=eq.'+SV.date+'&select=rev',{headers:hdr(false)}).then(function(r){return r.json();}).then(function(x){
    var rv=x&&x[0]?x[0].rev:0;if(!rv||rv===SV.rev)return;
    return liveFetch(false).then(function(){var ae=DOC.activeElement;if(!(ae&&/INPUT|SELECT|TEXTAREA/.test(ae.tagName)))render();});
  }).catch(function(){});
},2500);
/* Startseite der Spielbetrieb-Seite: läuft heute ein echter Abend? */
function gateLoad(){if(!LIVEAUTH||SV.gateLoaded)return;SV.gateLoaded=true;var d=realToday();
  fetch(SBU+'/rest/v1/events?date=eq.'+d+'&select=date,rev,state,status,test',{headers:hdr(false)}).then(function(r){return r.json();})
    .then(function(x){SV.gate=x&&x[0]&&x[0].state?x[0]:null;if(SV.gate)ensurePlayers(SV.gate.state);if(S.view==='gate')render();}).catch(function(){});}
/* Abgeschlossene echte Abende in die Saison-Statistik übernehmen (Homepage und Spielbetrieb) */
function loadRealSeasons(){
  fetch(SBU+'/rest/v1/events?select=state&status=eq.done&test=eq.false&order=date',{headers:{apikey:SBK}}).then(function(r){return r.ok?r.json():[];}).then(function(L){
    if(!L||!L.length)return;var last=null;
    L.forEach(function(x){var ev=x.state;if(!ev||!ev.date)return;ensurePlayers(ev);ev.archived=true;ev.season=ev.season||ev.date.slice(0,4);
      if(!ARCHIVE.some(function(a){return a.date===ev.date&&a.season===ev.season&&!!a.archived;}))ARCHIVE.push(ev);last=ev.season;});
    if(last&&SITE){S.season=last;}render();}).catch(function(){});
}
/* ===== Echte Anmeldung Turnierleitung / Boards (Supabase Auth) ===== */
var LIVEAUTH=/github\.io$|cda-ev\.eu$/.test(location.hostname);
var AUTH=null;try{AUTH=JSON.parse(localStorage.getItem('cda-auth')||'null');}catch(e){}
function authEmail(role){return role==='lead'?'leitung@cda-ev.de':'board'+(+role.slice(1)+1)+'@cda-ev.de';}
function authSave(role,j){AUTH={role:role,access:j.access_token,refresh:j.refresh_token,exp:Date.now()+(j.expires_in||3600)*1000};try{localStorage.setItem('cda-auth',JSON.stringify(AUTH));}catch(e){}}
function authLogin(role,pw){
  var SB_='https://qeevsqrmltewbtrnfrfm.supabase.co',K_='sb_publishable_pwnzx63cque5lKZEVCe4mA_5SvBP8Yd';
  return fetch(SB_+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:K_,'Content-Type':'application/json'},body:JSON.stringify({email:authEmail(role),password:pw})})
    .then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(r.status===400?'Passwort stimmt nicht.':'Anmeldung gerade nicht möglich.');return j;});},function(){throw new Error('Keine Verbindung. Ist das Gerät online?');})
    .then(function(j){return fetch(SB_+'/rest/v1/staff?select=role,board',{headers:{apikey:K_,Authorization:'Bearer '+j.access_token}}).then(function(r){return r.json();}).then(function(st){
      var ok=st&&st[0]&&(role==='lead'?st[0].role==='lead':st[0].role==='board'&&st[0].board===+role.slice(1)+1);
      if(!ok)throw new Error('Dieser Zugang ist noch nicht freigeschaltet.');authSave(role,j);});});
}
function authRefresh(){
  if(!AUTH||!AUTH.refresh||AUTH.exp-Date.now()>5*60*1000)return;
  fetch('https://qeevsqrmltewbtrnfrfm.supabase.co/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:'sb_publishable_pwnzx63cque5lKZEVCe4mA_5SvBP8Yd','Content-Type':'application/json'},body:JSON.stringify({refresh_token:AUTH.refresh})})
    .then(function(r){return r.ok?r.json():null;}).then(function(j){if(j)authSave(AUTH.role,j);}).catch(function(){});
}
if(!SITE)setInterval(authRefresh,4*60*1000);
function authLogout(){if(AUTH&&AUTH.access){fetch('https://qeevsqrmltewbtrnfrfm.supabase.co/auth/v1/logout',{method:'POST',headers:{apikey:'sb_publishable_pwnzx63cque5lKZEVCe4mA_5SvBP8Yd',Authorization:'Bearer '+AUTH.access}}).catch(function(){});}
  AUTH=null;try{localStorage.removeItem('cda-auth');}catch(e){}}
/* ===== Anmeldungen von der Homepage (Supabase) + WhatsApp-Nachricht ===== */
var SBC={url:'https://qeevsqrmltewbtrnfrfm.supabase.co',key:'sb_publishable_pwnzx63cque5lKZEVCe4mA_5SvBP8Yd'};
var HOME_URL=/github\.io$|cda-ev\.eu$/.test(location.hostname)?location.origin+location.pathname.replace(/[^\/]*$/,''):'https://kesselringl.github.io/cda-website/';
S.sb={state:'idle',rows:[],players:[]};
function realToday(){var d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);}
function sbLoad(){
  if(SITE)return;S.sb.state='loading';var h={apikey:SBC.key};
  Promise.all([fetch(SBC.url+'/rest/v1/players?select=id,name&order=name',{headers:h}).then(function(r){if(!r.ok)throw 0;return r.json();}),
    fetch(SBC.url+'/rest/v1/signups?select=event_date,player_id,guest_name,created_at&event_date=gte.'+realToday()+'&order=created_at',{headers:h}).then(function(r){if(!r.ok)throw 0;return r.json();})])
  .then(function(x){S.sb={state:'ok',players:x[0],rows:x[1]};if(S.view==='lead')render();})
  .catch(function(){S.sb={state:'err',rows:[],players:[]};if(S.view==='lead')render();});
}
function sbNext(){var ds={};S.sb.rows.forEach(function(r){ds[r.event_date]=1;});var t=realToday(),d=new Date(t+'T12:00:00Z');while(d.getUTCDay()!==4)d.setUTCDate(d.getUTCDate()+1);var thu=d.toISOString().slice(0,10);
  var all=Object.keys(ds).concat([thu]).sort();return all[0];}
function sbNames(date){var pn=function(id){var p=S.sb.players.filter(function(x){return x.id===id;})[0];return p?p.name:'?';};
  return S.sb.rows.filter(function(r){return r.event_date===date;}).map(function(r){return r.player_id?{name:pn(r.player_id),guest:false}:{name:r.guest_name,guest:true};});}
function realModeName(date){if(date<'2027-01-07')return 'Offene Competition';var m=calMode(date);return m&&MODES[m]?MODES[m].name:'Competition';}
function waText(date){var L=sbNames(date),dt=new Date(date+'T12:00:00'),wd=dt.toLocaleDateString('de-DE',{weekday:'long'}),dd=dt.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'});
  var diff=Math.round((dt-new Date(realToday()+'T12:00:00'))/864e5),when=diff===0?'Heute':diff===1?'Morgen':wd;
  return '🎯 '+when+' ist Competition!\n'+wd+', '+dd+' · '+realModeName(date)+' · ab 20 Uhr im Bismarck Bistro\n\n'+
    (L.length?'Schon '+L.length+' angemeldet: '+L.map(function(x){return x.name.split(' ')[0];}).join(', ')+'\n\n':'Noch ist niemand angemeldet, sei der Erste!\n\n')+
    'Hier mit einem Tipp anmelden oder absagen:\n'+HOME_URL+'?s=wa#kontakt/'+date;}
function sbPanel(){
  if(SITE)return '';
  if(S.sb.state==='idle'){setTimeout(sbLoad,0);}
  if(S.sb.state!=='ok')return '<section class="panel sbp"><h2>Anmeldungen von der Homepage</h2><p class="muted" style="margin:0">'+(S.sb.state==='err'?'Die Anmeldungen sind gerade nicht erreichbar (keine Verbindung zur Datenbank). <button class="btn small" data-act="sbreload">Nochmal versuchen</button>':'Wird geladen …')+'</p></section>';
  var date=sbNext(),L=sbNames(date),txt=waText(date);
  var known=L.filter(function(x){return !x.guest;}).map(function(x){return x.name;}),match=PLAYERS.filter(function(p){return known.indexOf(p.name)>=0;}).length;
  return '<section class="panel sbp"><div class="row" style="justify-content:space-between;align-items:baseline"><h2 style="margin:0">Anmeldungen von der Homepage</h2><button class="btn small" data-act="sbreload">Aktualisieren</button></div>'+
    '<p class="muted" style="margin:4px 0 12px">'+new Date(date+'T12:00:00').toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'})+' · '+realModeName(date)+'</p>'+
    '<div class="sbgrid"><div><div class="big-n num">'+L.length+'</div><p class="muted" style="margin:0 0 10px">angemeldet</p>'+
      (L.length?'<ul class="sblist">'+L.map(function(x){return '<li>'+esc(x.name)+(x.guest?' <span class="muted">(Gast)</span>':'')+'</li>';}).join('')+'</ul>'+
      '<button class="btn primary small" data-act="sbtake" data-date="'+date+'">Alle Angemeldeten einchecken</button><p class="cap">Danach kannst du unten jeden mit einem Tippen wieder abwählen, der spontan nicht kommt.</p>':'<p class="muted">Noch keine Anmeldungen.</p>')+
      (L.length>16?'<p class="warn">'+L.length+' Anmeldungen für 2 Boards: Spielortwechsel (Sergio\'s, 5 Boards) überlegen.</p>':'')+'</div>'+
    '<div class="wa"><h3>Nachricht für die WhatsApp-Gruppe</h3><p class="muted" style="margin:0">Den Text dafür gibt es jetzt im Grafik-Studio im Reiter „WhatsApp“ – jedes Mal neu formuliert.</p><a class="btn small" href="grafik-studio.html" target="_blank" rel="noopener" style="margin-top:8px">Zum Grafik-Studio</a></div></div></section>';
}
function fitTarget(md,p){if(md.finals)return p.dur<=S.legs.fh*60;var t=S.legs.target.split(':'),lim=(+t[0]===0?24:+t[0])*60+(+t[1])-20*60;return p.dur<=lim;}
function chooseLegs(md,n){
  if(S.legs.custom)return {L:S.legs.custom,lvl:-1};
  if(S.legs.auto){for(var l=0;l<4;l++){var L=legPreset(md,l),p=makePlan(n,S.mode,S.boards.length,L);if(!p||fitTarget(md,p))return {L:L,lvl:l,fit:true};}return {L:legPreset(md,3),lvl:3,fit:false};}
  return {L:legPreset(md,S.legs.lvl),lvl:S.legs.lvl};
}
function venueTip(md,n,LG){
  if(md.finals||S.boards.length>=5||LG.lvl<2&&LG.fit!==false)return '';
  var best=null;
  ['sergios','tsv'].forEach(function(k){if(best)return;var v=VENUES[k];
    for(var l=0;l<4;l++){var p0=makePlan(n,S.mode,v.boards.length,legPreset(md,l));if(p0&&fitTarget(md,p0)){if(l<LG.lvl||LG.fit===false)best={k:k,v:v,p:p0,l:l};break;}}});
  if(!best)return '';
  return '<p class="warn">Viele Anmeldungen für '+S.boards.length+' Boards. Im '+best.v.name+' ('+best.v.boards.length+' Boards) wärt ihr '+(best.l===0?'ohne gekürzte Legs':'mit „'+LEG_LVL[best.l]+'“')+' um ca. '+clock(best.p.dur)+' Uhr fertig. <button class="btn small" data-act="venue" data-v="'+best.k+'">Spielort wechseln</button></p>';
}
function fmtBox(md,n,LG){if(md.finals||n<4)return '';
  var pg=makePlan(n,S.mode,S.boards.length,LG.L,'groups'),pd=makePlan(n,S.mode,S.boards.length,LG.L,'dko'),ps=makePlan(n,S.mode,S.boards.length,LG.L,'sko');if(!pg||!pd||!ps)return '';
  var b=function(f,lab,p){return '<button class="fmtb'+(S.fmt===f?' on':'')+'" data-act="fmt" data-f="'+f+'" aria-pressed="'+(S.fmt===f)+'"><b>'+lab+'</b><span>'+p.total+' Matches · Ende ca. '+clock(p.dur)+' Uhr</span></button>';};
  var cur=S.fmt==='dko'?pd:S.fmt==='sko'?ps:pg,alt=[[pd,'Doppel-K.-o.'],[pg,'Gruppen + K.-o.'],[ps,'Single-K.-o.']].filter(function(x){return x[0]!==cur&&fitTarget(md,x[0]);}).sort(function(a,b){return b[0].total-a[0].total;})[0];
  var tip=!fitTarget(md,cur)&&alt?'<p class="warn" style="margin:8px 0 0">Mit so vielen Teilnehmern wird es eng. Mit '+alt[1]+' wärt ihr ca. '+Math.max(0,cur.dur-alt[0].dur)+' Minuten früher fertig.</p>':'';
  return '<div class="fmtsel"><span class="muted" style="font-size:.85rem">Turnierform</span><div class="fmtrow">'+b('groups','Gruppen + K.-o.',pg)+b('dko','Doppel-K.-o.',pd)+b('sko','Single-K.-o.',ps)+'</div>'+tip+'<p class="cap" style="margin:6px 0 0">'+(S.fmt==='sko'?'Single-K.-o.: am schnellsten, aber nach einer Niederlage ist Schluss. Gut bei vielen Teilnehmern oder wenig Zeit.':S.fmt==='dko'?'Doppel-K.-o.: Jeder hat eine zweite Chance, erst die zweite Niederlage scheidet aus.':'Gruppen + K.-o.: Die meisten Spiele für alle, danach K.-o. der Gruppenbesten.')+'</p></div>';}
function legBox(md,LG,p){
  var L=LG.L,btn=function(act,lab,on,extra){return '<button class="btn small'+(on?' on':'')+'" data-act="'+act+'"'+(extra||'')+' aria-pressed="'+!!on+'">'+lab+'</button>';};
  var seg=LEG_LVL.map(function(n,i){return btn('leglvl',n,!S.legs.auto&&!S.legs.custom&&S.legs.lvl===i,' data-l="'+i+'"');}).join('')+btn('legauto','Automatisch',S.legs.auto);
  var tgt='';
  if(S.legs.auto)tgt=md.finals?'<label class="legt">Maximale Spielzeit <select data-legfh="1">'+[5,6,7,8,9].map(function(h){return '<option value="'+h+'"'+(S.legs.fh===h?' selected':'')+'>'+h+' Stunden</option>';}).join('')+'</select></label>'
    :'<label class="legt">Fertig bis <select data-legtarget="1">'+['22:30','23:00','23:30'].map(function(t){return '<option'+(S.legs.target===t?' selected':'')+'>'+t+' Uhr</option>';}).join('')+'</select></label>';
  var dko=p&&p.dko,sko=p&&p.sko,rows=(sko?[['sk','Erste Runden'],['late','Halbfinale'],['side','Spiel um Platz 3'],['fin','Finale']]:dko?[['wb','Gewinnerseite (Anfang)'],['lb','Verliererseite (Anfang)'],['late','Halbfinals beider Seiten'],['side','Finale Gewinner- und Verliererseite'],['fin','Großes Finale']]:md.finals?[['g','Vorrunde'],['g2','Zwischenrunde'],['ko','K.-o.-Runde'],['fin','Finale']]:[['g','Gruppenphase'],['ko','K.-o.-Runde'],['fin','Finale']]).map(function(r){var ft=L[r[0]]||1,def=legPreset(md,0)[r[0]];
    return '<li class="'+(ft<def?'cut':'')+'"><span>'+r[1]+'</span><span class="lsw"><button data-act="legadj" data-k="'+r[0]+'" data-d="-1" aria-label="'+r[1]+' kürzer"'+(ft<=1?' disabled':'')+'>−</button><b>'+bo(ft)+'</b><button data-act="legadj" data-k="'+r[0]+'" data-d="1" aria-label="'+r[1]+' länger"'+(ft>=4?' disabled':'')+'>+</button></span></li>';}).join('');
  if(sko){var noteS=(S.legs.auto&&S.legs.target==='23:00'?'Vorgabe: Der Abend ist immer bis 23 Uhr fertig. ':'')+(S.legs.auto?(LG.fit?'Der Computer hat <b>„'+LEG_LVL[LG.lvl]+'“</b> gewählt. ':'<span class="warn-t">Auch mit den kürzesten Legs wird es knapp. Mehr Boards einplanen.</span> '):S.legs.custom?'Eigene Einstellung. ':'')+
    'Im Single-K.-o. hat jeder nur ein Match sicher, deshalb starten die ersten Runden mit Best of 3. Kürzer: erste Runden Best of 1 · Kurz: zusätzlich Halbfinale Best of 1, Finale Best of 3 · Sehr kurz: auch das Spiel um Platz 3 Best of 1.';
    return '<div class="legbox"><h3>Legs im Single-K.-o.</h3><div class="legseg">'+seg+'</div>'+tgt+'<ul class="legrows">'+rows+'</ul><p class="cap">'+noteS+'</p></div>';}
  if(dko){var noteD=(S.legs.auto&&S.legs.target==='23:00'?'Vorgabe: Der Abend ist immer bis 23 Uhr fertig. ':'')+(S.legs.auto?(LG.fit?'Der Computer hat <b>„'+LEG_LVL[LG.lvl]+'“</b> gewählt. ':'<span class="warn-t">Auch mit den kürzesten Legs wird es knapp. Mehr Boards einplanen.</span> '):S.legs.custom?'Eigene Einstellung. ':'')+
    'Die Verliererseite startet mit Best of 1, damit es zügig geht. Je weiter das Turnier läuft, desto länger werden die Matches: Halbfinals, Seitenfinals und großes Finale. Kürzer: Gewinnerseite Best of 1 · Kurz: Halbfinals Best of 1, Finale Best of 3 · Sehr kurz: auch die Seitenfinals Best of 1.';
    return '<div class="legbox"><h3>Legs im Doppel-K.-o.</h3><div class="legseg">'+seg+'</div>'+tgt+'<ul class="legrows">'+rows+'</ul><p class="cap">'+noteD+'</p></div>';}
  var note=(S.legs.auto&&S.legs.target==='23:00'&&!MODES[S.mode].finals?'Vorgabe: Der Abend ist immer bis 23 Uhr fertig. ':'')+(S.legs.auto?(LG.fit?'Der Computer hat <b>„'+LEG_LVL[LG.lvl]+'“</b> gewählt. '+(LG.lvl===0?'Es passt ohne Kürzen.':'Er kürzt zuerst die '+(md.finals?'Vorrunde':'Gruppenphase')+', dann die '+(md.finals?'Zwischenrunde, dann die K.-o.-Runde':'K.-o.-Runde')+'. Das Finale bleibt am längsten.'):'<span class="warn-t">Auch mit den kürzesten Legs wird es knapp. Mehr Boards einplanen.</span>')
    :S.legs.custom?'Eigene Einstellung. Mit einer Stufe oben geht es zurück zum Vorschlag.':'Kürzer: '+(md.finals?'Vorrunde':'Gruppenphase')+' nur Best of 1 · Kurz: zusätzlich '+(md.finals?'Zwischenrunde Best of 1':'Finale Best of 3')+' · Sehr kurz: auch die K.-o.-Runde kürzer.');
  return '<div class="legbox"><h3>Legs</h3><div class="legseg">'+seg+'</div>'+tgt+'<ul class="legrows">'+rows+'</ul><p class="cap">'+note+'</p></div>';
}
function mItem(ev,m){
  var la=legsWon(m,0),lb=legsWon(m,1),done=m.status==='done',tag=m.stage+(m.status==='live'?' · Board '+(m.board+1):'');
  if(!m.a||!m.b)return '<li class="mitem tbd"><span class="tag">'+m.stage+'</span><span class="a">'+(m.a?partH(ev,m.a):'offen')+'</span><span class="s">–</span><span class="b">'+(m.b?partH(ev,m.b):'offen')+'</span></li>';
  return '<li class="mitem"><span class="tag">'+tag+'</span><span class="a'+(done&&m.winner===0?' w':'')+'">'+partH(ev,m.a)+'</span><span class="s num">'+(done||m.status==='live'?la+':'+lb:'–')+'</span><span class="b'+(done&&m.winner===1?' w':'')+'">'+partH(ev,m.b)+'</span></li>';
}
function devTag(t){return '<span class="devtag '+(t==='pc'?'t-pc':'t-tablet')+'" style="background:color-mix(in srgb,'+(t==='pc'?'var(--green)':'var(--gold)')+' 20%,transparent);color:'+(t==='pc'?'var(--green-ink)':'var(--gold)')+'">'+(t==='pc'?'PC':'Tablet')+'</span>';}
function boardCard(ev,b,withBtn){
  var m=byId(ev,ev.boards[b]),head='<span class="bname">Board '+(b+1)+devTag(ev.btype[b])+'</span>';
  if(!m)return '<div class="panel bcard"><div class="bhead">'+head+'<span class="pill free">frei</span></div><p class="muted" style="margin:0">'+(ev.phase==='done'?'Abend beendet.':'Wartet auf das nächste Match.')+'</p></div>';
  var leg=curLeg(m),t=turn(leg),cr=MD(ev).kind==='cricket',st=cr?cState(m,leg,{p:t,dl:ev.cin[b]}):null;
  var row=function(p){var id=p?m.b:m.a;return '<span class="n'+(!m.over&&m.started&&t===p?' on':'')+'">'+partH(ev,id)+'</span><span class="av num">'+sideQ(ev,m,p)+'</span><span class="l num">'+legsWon(m,p)+'</span><span class="r num">'+(m.over?'':cr?st.pts[p]:restX(ev,m,leg,p))+'</span>';};
  return '<div class="panel bcard"><div class="bhead">'+head+'<span class="pill live">'+(m.over?'Ergebnis':m.started?'live':'aufgerufen')+'</span></div><span class="muted" style="font-size:.8rem">'+m.stage+' · Best of '+(m.ft*2-1)+' · Schreiber: '+(m.writer?pnh(m.writer):'offen')+'</span><div class="mini">'+row(0)+row(1)+'</div>'+
    (withBtn?'<div class="row"><button class="btn small" data-act="view" data-v="b'+b+'">Zum Scorer</button>'+(noSim()?'':'<button class="btn small" data-act="sim" data-b="'+b+'">Match simulieren</button>')+'</div>':'')+'</div>';
}
function groupTables(ev){
  var cr=MD(ev).kind==='cricket',out='';
  [[ev.groups,1,MD(ev).finals?'Vorrunde':'Gruppe'],[ev.groups2,2,'Zwischenrunde']].forEach(function(x){if(!x[0])return;
    var adv=MD(ev).finals?(x[1]===1?3:2):2;
    out+=x[0].map(function(g,gi){var t=standings(ev,gi,x[1]);
      return '<div class="panel"><h3>'+x[2]+' '+GL[gi]+'</h3><div class="tbl-wrap"><table><thead><tr><th>#</th><th>'+(MD(ev).doubles?'Doppel':'Spieler')+'</th><th>Sp</th><th>S</th><th>Legs</th><th>'+(cr?'MPR':'Avg')+'</th></tr></thead><tbody>'+
        t.map(function(r,i){return '<tr class="'+(i<adv?'q':'')+'"><td>'+(i+1)+'</td><td>'+partH(ev,r.id)+'</td><td>'+r.sp+'</td><td>'+r.s+'</td><td>'+r.lf+':'+r.la+'</td><td>'+fmt2(r.q)+'</td></tr>';}).join('')+'</tbody></table></div></div>';}).join('');});
  return out;
}
function queue(ev,n){var w=ev.matches.filter(function(m){return m.status==='wait';}).sort(function(x,y){return x.order-y.order;}).slice(0,n);
  return w.length?'<ul class="mlist">'+w.map(function(m){return mItem(ev,m);}).join('')+'</ul>':'<p class="muted" style="margin:0">Keine weiteren Matches.</p>';}
function koList(ev){var ko=ev.matches.filter(function(m){return m.kind==='KO';});
  if(ev.plan&&ev.plan.dko){var sec=function(t,f){var l=ko.filter(f);return l.length?'<h4 class="dkoh">'+t+'</h4><ul class="mlist">'+l.map(function(m){return mItem(ev,m);}).join('')+'</ul>':'';};
    return sec('Gewinnerseite',function(m){return m.dk==='W';})+sec('Verliererseite',function(m){return m.dk==='L';})+sec('Finale',function(m){return m.dk==='F';});}
  if(ev.plan&&ev.plan.sko){var st=[];ko.forEach(function(m){if(st.indexOf(m.stage)<0)st.push(m.stage);});
    return st.map(function(t){return '<h4 class="dkoh">'+t+'</h4><ul class="mlist">'+ko.filter(function(m){return m.stage===t;}).map(function(m){return mItem(ev,m);}).join('')+'</ul>';}).join('');}
  if(!ko.length)return '<p class="muted" style="margin:0">Startet automatisch nach der '+(MD(ev).finals?'Zwischenrunde':'Gruppenphase')+'. Es kommen '+ev.plan.q+' weiter.</p>';
  return '<ul class="mlist">'+ko.map(function(m){return mItem(ev,m);}).join('')+'</ul>';}
function viewLead(){
  var ev=S.ev,done=ev.matches.filter(function(m){return m.status==='done';}).length,total=ev.plan.total;
  var pd=ev.phase==='done'?podium(ev):null;
  return '<div class="grid" style="gap:20px">'+modeBar(ev)+
    '<section class="panel"><div class="row" style="justify-content:space-between"><div><h2 style="margin:0">'+(pd?'Sieger: '+partH(ev,pd[0].part):'Abend läuft')+'</h2><span class="muted num">'+done+' von '+total+' Matches gespielt · '+ev.plan.txt+' · '+legTxt(MD(ev),legsOf(ev),ev.plan)+'</span></div>'+
    '<div class="row">'+(pd?'<button class="btn small primary" data-act="archive">Abend abschließen und in die Saison übernehmen</button>':(noSim()?'':'<button class="btn small" data-act="simall">Rest simulieren</button>'))+(S.live&&!(ev&&ev.test)?'':'<button class="btn small" data-act="reset">'+(S.live?'Testabend löschen':'Neuer Abend')+'</button>')+'</div></div><div class="progress"><i style="width:'+Math.round(done/total*100)+'%"></i></div></section>'+
    (pd?'<div class="grid g2"><section class="panel">'+recap(ev)+'</section><section class="panel"><h3>Siegerehrung</h3>'+ceremonyList(ev,pd)+'</section></div>':'')+
    '<div class="grid '+(ev.boards.length>2?'g3':'g2')+'">'+ev.boards.map(function(_,b){return boardCard(ev,b,true);}).join('')+'</div>'+
    '<div class="grid g2"><section class="panel"><h3>Als Nächstes</h3>'+queue(ev,5)+'<p class="muted" style="font-size:.82rem;margin:10px 0 0">Wird ein Board frei, kommt automatisch das nächste Match drauf. Schreiber ist der Verlierer des letzten Matches am Board.</p></section>'+
    '<section class="panel"><h3>K.-o.-Runde</h3>'+koList(ev)+'</section></div><div class="grid g3">'+groupTables(ev)+'</div></div>';
}
function ceremonyList(ev,pd){var md=MD(ev),n=md.finals?6:3;return '<ul class="rest6">'+pd.slice(0,n).map(function(x){return '<li><b>'+x.place+'.</b><span>'+partH(ev,x.part)+'</span><span class="pm">'+(x.money?eur(x.money):md.masters?x.pts+' P.':'')+'</span></li>';}).join('')+'</ul>';}

/* --- Scorer --- */
function callScreen(ev,b,m){
  return '<div class="call"><span class="stage">Board '+(b+1)+' · '+MD(ev).name+' · '+m.stage+' · Best of '+(m.ft*2-1)+'</span><h2 class="callh">Match aufgerufen</h2>'+
    '<div class="vs"><span>'+partH(ev,m.a)+'</span><i>gegen</i><span>'+partH(ev,m.b)+'</span></div>'+
    '<div class="writer'+(m.writer?'':' none')+'"><span class="wl">✎ Schreiber</span><span class="wn">'+(m.writer?pnh(m.writer):'Bitte festlegen')+'</span></div>'+
    '<p class="muted" style="margin:0">'+partH(ev,m.a)+' beginnt das erste Leg.</p><button class="btn primary" data-act="go" data-b="'+b+'">Alle da, Match starten'+(ev.btype[b]==='pc'?' <kbd>Enter</kbd>':'')+'</button></div>';
}
function overPanel(ev,b,m){
  var w=m.winner;return '<div class="over"><span class="muted">Match beendet</span><span class="res">'+partH(ev,w===0?m.a:m.b)+' gewinnt '+legsWon(m,w)+':'+legsWon(m,1-w)+'</span><span>Schreiber fürs nächste Match an diesem Board: <b>'+partH(ev,w===0?m.b:m.a)+'</b></span><div class="row" style="justify-content:center"><button class="btn primary" data-act="commit" data-b="'+b+'">Ergebnis speichern, nächstes Match <kbd>Enter</kbd></button><button class="btn" data-act="undo" data-b="'+b+'">Korrigieren</button></div></div>';
}
function ceremony(ev){
  var pd=podium(ev),md=MD(ev),top=pd.slice(0,3),by={};top.forEach(function(x){by[x.place]=x;});
  var cell=function(pl,cls){var x=by[pl];if(!x)return '<div></div>';return '<div class="pod '+cls+'"><span class="pl">'+pl+'</span><span class="pnm">'+partH(ev,x.part)+'</span>'+(x.money?'<span class="pm">'+eur(x.money)+'</span>':md.masters?'<span class="muted">'+x.pts+' Masters-Punkte</span>':'')+'</div>';};
  var more=md.finals?'<ul class="rest6">'+pd.slice(3,6).map(function(x){return '<li><b>'+x.place+'.</b><span>'+partH(ev,x.part)+'</span><span class="pm">'+(x.money?eur(x.money):'')+'</span></li>';}).join('')+'</ul>':'';
  return '<div class="cer"><span class="ct">'+md.name+' · '+wdS(ev.date)+' '+dshort(ev.date)+(md.masters?' · Preisgeld '+eur(Object.keys(ev.parts).length*DAY_FEE):md.finals?' · Masters-Pott '+eur(potFor(ev.season)):'')+'</span><h2>Siegerehrung</h2><div class="podium3">'+cell(2,'p2')+cell(1,'p1')+cell(3,'p3')+'</div>'+more+
    (md.masters?'<p class="muted" style="margin:0">Dazu wandern heute '+eur(Object.keys(ev.parts).length*POT_FEE)+' in den Masters-Pott.</p>':'')+'</div>';
}
function viewBoard(b){
  var ev=S.ev,nbd=ev.phase==='checkin'?S.boards.length:ev.boards.length;
  if(b>=nbd)return '<div class="panel idle"><div class="big-n">Board '+(b+1)+'</div><p class="muted" style="margin:0">Dieses Board ist heute nicht im Einsatz. Die Turnierleitung hat '+nbd+' Boards eingestellt. Sobald Board '+(b+1)+' dazukommt, erscheint hier automatisch das nächste Match.</p></div>';
  var m=byId(ev,ev.boards[b]);
  if(ev.phase==='done')return ceremony(ev);
  if(!m)return '<div class="panel idle"><div class="big-n">Board '+(b+1)+'</div><p class="muted" style="margin:0">'+(ev.phase==='checkin'?'Der Abend ist noch nicht gestartet.':'Gerade kein Match. Sobald zwei Teilnehmer frei sind, erscheint es hier automatisch.')+'</p></div>';
  if(!m.started)return callScreen(ev,b,m);
  var leg=curLeg(m),t=turn(leg),tab=ev.btype[b]==='tablet',head='<div class="sb-head"><span class="stage">Board '+(b+1)+devTag(ev.btype[b])+' · '+MD(ev).name+' · '+m.stage+'</span><span class="wsmall">Schreiber: '+(m.writer?pnh(m.writer):'offen')+'</span><span class="fmt num">Leg '+m.legs.length+' · '+MD(ev).sub+' · Best of '+(m.ft*2-1)+'</span></div>';
  return '<div class="scorer'+(tab?' tablet':'')+'">'+head+(MD(ev).kind==='cricket'?cricketBoard(ev,b,m,leg,t):x01Board(ev,b,m,leg,t))+'</div>';
}
function x01Board(ev,b,m,leg,t){
  var md=MD(ev);
  var side=function(p){
    var id=p?m.b:m.a,part=ev.parts[id],r=restX(ev,m,leg,p),vs=leg.visits.filter(function(v){return v.p===p;}),dt=sum(vs.map(function(v){return v.darts;}));
    var inn=isIn(ev,leg,p),co=!m.over&&inn&&CO[r]?CO[r].join(' · '):'';if(md.di&&!inn)co='<span class="badge-di">Double-In offen</span>';
    var last=vs.slice(-6).map(function(v){return '<span class="'+(v.bust?'bust':v.score>=100?'hi':'')+'">'+v.score+'</span>';}).join('');
    var thr=part.members.length>1?'<span class="thrower">Am Board: <b>'+pnh(thrower(ev,m,leg,p))+'</b></span>':'';
    return '<div class="side'+(!m.over&&t===p?' on':'')+'"><span class="legs num">'+legsWon(m,p)+'<small>Legs</small></span><span class="pn">'+(leg.starter===p?'● ':'')+partH(ev,id)+'</span>'+thr+'<span class="rest num">'+r+'</span><span class="co">'+co+'</span><div class="visits">'+last+'</div>'+
      '<div class="st"><span><b class="num">'+sideQ(ev,m,p).replace('Ø ','')+'</b> Avg</span><span><b class="num">'+dt+'</b> Darts</span><span><b class="num">'+vs.length+'</b> Aufnahmen</span></div></div>';
  };
  var input,msg=S.msg[b]||'',err=msg.indexOf('err:')===0;
  if(m.over)input=overPanel(ev,b,m);
  else if(ev.ask[b]){var a=ev.ask[b],btns='';for(var d=a.min;d<=3;d++)btns+='<button class="btn primary" data-act="co" data-b="'+b+'" data-d="'+d+'">'+d+' Dart'+(d>1?'s':'')+'</button>';
    input='<div class="ask"><p>Check! '+pnh(a.who)+' macht '+a.score+'. Mit wie vielen Darts in dieser Aufnahme?</p><div class="row">'+btns+'<button class="btn" data-act="undo" data-b="'+b+'">Abbrechen</button></div></div>';}
  else{
    var pad='';[7,8,9,4,5,6,1,2,3].forEach(function(k){pad+='<button data-act="key" data-b="'+b+'" data-k="'+k+'">'+k+'</button>';});
    pad+='<button class="fn" data-act="key" data-b="'+b+'" data-k="Backspace">Löschen</button><button data-act="key" data-b="'+b+'" data-k="0">0</button><button class="ok" data-act="key" data-b="'+b+'" data-k="Enter">Eintragen</button><button class="fn" data-act="undo" data-b="'+b+'">↶ Zurück</button><button class="rs" data-act="key" data-b="'+b+'" data-k="Rest">Restscore</button>';
    var qL=[26,41,45,60,81,85,100,140,180].map(function(q){return '<button data-act="quick" data-b="'+b+'" data-q="'+q+'"'+(q===180?' class="q180"':'')+'>'+q+'</button>';}).join('');
    input='<div class="entry2"><div class="quick2 ql">'+qL+'</div><div class="inbox2"><span class="who">Aufnahme von '+pnh(thrower(ev,m,leg,t))+'</span><div class="val num">'+esc(S.input[b]||'')+'<span class="cursor"></span></div><div class="msg'+(err?' err':'')+'">'+esc(err?msg.slice(4):msg)+'</div><div class="pad">'+pad+'</div></div></div>'+
      '<div class="legend"><span><kbd>0–9</kbd> Punkte</span><span><kbd>Enter</kbd> eintragen</span><span><kbd>R</kbd> Restscore</span><span><kbd>Strg+Z</kbd> zurück</span>'+(md.di?'<span>Double-In: nur die Punkte ab dem Doppel eintragen</span>':'')+'<button class="linkbtn" data-act="simv" data-b="'+b+'">Demo: Aufnahme simulieren</button></div>'+
      (ev.btype[b]==='tablet'&&!noSim()?'<div class="row" style="justify-content:center"><button class="linkbtn" data-act="simv" data-b="'+b+'">Demo: Aufnahme simulieren</button></div>':'');
  }
  return '<div class="duel">'+side(0)+side(1)+'</div>'+input;
}
function markSvg(c){if(!c)return '';var s='<svg viewBox="0 0 30 30" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">';
  if(c>=1)s+='<line x1="7" y1="23" x2="23" y2="7"/>';if(c>=2)s+='<line x1="7" y1="7" x2="23" y2="23"/>';if(c>=3)s+='<circle cx="15" cy="15" r="12" stroke-width="2.5"/>';return s+'</svg>';}
function cricketBoard(ev,b,m,leg,t){
  var cur=ev.cin[b],st=cState(m,leg,{p:t,dl:cur});
  var head=function(p){var id=p?m.b:m.a,part=ev.parts[id];return '<div class="chead'+(p?' r':'')+(!m.over&&t===p?' on':'')+'"><span class="pn">'+(leg.starter===p?'● ':'')+partH(ev,id)+'</span>'+(part.members.length>1?'<span class="thrower">Am Board: <b>'+pnh(thrower(ev,m,leg,p))+'</b></span>':'')+'<span class="pts num">'+st.pts[p]+'</span><span class="lg num">'+legsWon(m,p)+' Legs · '+sideQ(ev,m,p)+'</span></div>';};
  var rows='<div class="crow ctop"><span></span><span style="text-align:center">Feld</span><span></span></div>'+CNUM.map(function(n){var a=st.mk[0][n]||0,c=st.mk[1][n]||0;
    return '<div class="crow'+(a>=3&&c>=3?' closed':'')+'"><span class="mk'+(a>=3?' done':'')+'">'+markSvg(a)+'</span><span class="no">'+(n===25?'B':n)+'</span><span class="mk'+(c>=3?' done':'')+'">'+markSvg(c)+'</span></div>';}).join('');
  var board='<div class="cboard">'+head(0)+'<div class="cmid">'+rows+'</div>'+head(1)+'</div>';
  if(m.over)return board+overPanel(ev,b,m);
  var vis=[0,1,2].map(function(i){var d=cur[i];return d?'<span>'+(d.n?(d.m===3?'T':d.m===2?'D':'')+(d.n===25?'B':d.n):'–')+'</span>':'<span class="empty">Dart '+(i+1)+'</span>';}).join('');
  var pad=CNUM.map(function(n){return '<span class="no">'+(n===25?'Bull':n)+'</span><button data-act="cd" data-b="'+b+'" data-n="'+n+'" data-m="1">'+(n===25?'25':'Single')+'</button><button data-act="cd" data-b="'+b+'" data-n="'+n+'" data-m="2">'+(n===25?'Bull':'Double')+'</button><button class="t" data-act="cd" data-b="'+b+'" data-n="'+n+'" data-m="3"'+(n===25?' disabled':'')+'>Triple</button>';}).join('');
  var msg=S.msg[b]||'',err=msg.indexOf('err:')===0;
  return board+'<div class="entry"><div class="inbox"><span class="who">Aufnahme von '+pnh(thrower(ev,m,leg,t))+'</span><div class="cvis">'+vis+'</div><div class="msg'+(err?' err':'')+'">'+esc(err?msg.slice(4):msg)+'</div>'+
    '<div class="keys"><span><kbd>T</kbd>/<kbd>D</kbd> + Zahl + <kbd>Enter</kbd> = ein Dart</span><span><kbd>0</kbd> <kbd>Enter</kbd> daneben</span><span>leeres <kbd>Enter</kbd> = Aufnahme fertig</span></div>'+
    '<div class="row muted" style="font-size:.9rem">Eingabe: <b style="color:var(--ink);font-family:var(--f-display);font-size:1.4rem;min-width:3ch">'+(esc(S.input[b]||'')||'–')+'</b></div>'+
    (noSim()?'':'<div class="row"><button class="linkbtn" data-act="simv" data-b="'+b+'">Demo: Aufnahme simulieren</button></div>')+'</div>'+
    '<div><div class="cpad">'+pad+'</div><div class="quick" style="grid-template-columns:1fr 1fr 1fr"><button data-act="cd" data-b="'+b+'" data-n="0" data-m="0">Daneben</button><button data-act="undo" data-b="'+b+'">↶ Zurück</button><button data-act="cend" data-b="'+b+'">Aufnahme fertig</button></div></div></div>';
}

/* --- Recap --- */
function recap(ev){
  var md=MD(ev),pd=podium(ev),n=Object.keys(ev.parts).length,best=null;
  ev.matches.forEach(function(m){if(!m.a||!m.b)return;var A=ev.parts[m.a],B=ev.parts[m.b];if(A.members.length!==1||B.members.length!==1||A.start!==501)return;
    m.legs.forEach(function(l){if(l.winner==null)return;var vs=l.visits.filter(function(v){return v.p===l.winner;}),d=sum(vs.map(function(v){return v.darts;}));
      if(!best||d<best.d)best={d:d,who:vs[0].who,vs:vs};});});
  var st=stats([ev]),n180=sum(Object.keys(st).map(function(k){return st[k].t180;})),hf=0,hfw=null,ba=0,baw=null;
  Object.keys(st).forEach(function(k){if(st[k].hf>hf){hf=st[k].hf;hfw=+k;}var a=avgOf(st[k]);if(st[k].dt>=45&&a>ba){ba=a;baw=+k;}});
  var fin=ev.matches.filter(function(m){return m.stage==='Finale';})[0],w=pd[0];
  return '<div class="recap"><span class="rt">'+md.name+' · '+wdS(ev.date)+' '+dshort(ev.date)+' · '+ev.pids.length+' Spieler</span>'+
    '<span class="rw">'+partN(ev,w.part)+'<small>gewinnt das Finale '+legsWon(fin,fin.winner)+':'+legsWon(fin,1-fin.winner)+' gegen '+esc(partN(ev,loserPart(fin)))+(w.money?' · '+eur(w.money):'')+'</small></span>'+
    (best&&md.kind==='x01'?'<div class="rleg"><span class="lh">Leg des Abends · '+esc(pn(best.who))+' · '+best.d+' Darts</span><div class="lv">'+best.vs.map(function(v){return '<span class="'+(v.co?'co':'')+'">'+v.score+'</span>';}).join('')+'</div></div>':'<div></div>')+
    '<ol class="rpod">'+pd.slice(0,md.finals?6:4).map(function(x){return '<li><b>'+x.place+'</b><span>'+esc(partN(ev,x.part))+'</span><span class="r">'+(x.money?eur(x.money):'')+'</span></li>';}).join('')+'</ol>'+
    '<div class="rstats"><div><b class="num">'+(md.kind==='x01'?n180:'–')+'</b><span>180er</span></div><div><b class="num">'+(hf||'–')+'</b><span>High Finish'+(hfw?' · '+esc(pn(hfw).split(' ')[0]):'')+'</span></div><div><b class="num">'+(ba?fmt1(ba):'–')+'</b><span>Bester Avg'+(baw?' · '+esc(pn(baw).split(' ')[0]):'')+'</span></div></div></div>'+
    '<p class="cap" style="text-align:center">Im echten System als Bild zum Herunterladen für Instagram.</p>';
}

/* --- Live --- */
function hlList(ev){
  var agg={},out=[];ev.hl.forEach(function(h){var k=h.who+'|'+h.t;if(agg[k]){agg[k].n++;return;}agg[k]={t:h.t,who:h.who,leg:h.leg,big:h.big,n:1};out.push(agg[k]);});
  out=out.slice(0,10);
  return out.length?'<ul class="hl">'+out.map(function(h){return '<li><b class="num">'+(h.n>1?h.n+'× ':'')+h.t+'</b><span>'+pnh(h.who)+(h.leg?' · Short Leg':h.big?' · High Finish':'')+'</span></li>';}).join('')+'</ul>':'<p class="muted" style="margin:0">Noch keine Highlights.</p>';
}
function statTable(evs,cricket){
  var st=stats(evs),ids=Object.keys(st).map(Number).filter(function(id){return cricket?st[id].cd:st[id].dt;});
  ids.sort(function(a,b){return cricket?mprOf(st[b])-mprOf(st[a]):avgOf(st[b])-avgOf(st[a]);});
  if(cricket)return '<table><thead><tr><th>#</th><th>Spieler</th><th>MPR</th><th>Marks</th><th>9-Marker</th><th>Siege</th></tr></thead><tbody>'+ids.map(function(id,i){var x=st[id];return '<tr><td>'+(i+1)+'</td><td>'+plink(id)+'</td><td>'+fmt2(mprOf(x))+'</td><td>'+x.mk+'</td><td>'+(x.m9||'–')+'</td><td>'+x.w+'/'+x.sp+'</td></tr>';}).join('')+'</tbody></table>';
  return '<table><thead><tr><th>#</th><th>Spieler</th><th>Avg</th><th>180</th><th>171+</th><th>Short Legs</th><th>High Finish</th><th>Bestes Leg</th></tr></thead><tbody>'+ids.map(function(id,i){var x=st[id];return '<tr><td>'+(i+1)+'</td><td>'+plink(id)+'</td><td>'+fmt2(avgOf(x))+'</td><td>'+(x.t180||'–')+'</td><td>'+(x.t171||'–')+'</td><td>'+(x.sl||'–')+'</td><td>'+(x.hf||'–')+'</td><td>'+(x.best?x.best+' Darts':'–')+'</td></tr>';}).join('')+'</tbody></table>';
}
function viewLive(){
  var ev=S.ev;
  if(ev.phase==='checkin')return '<div class="panel idle"><div class="big-n">Heute 20 Uhr</div><p class="muted" style="margin:0">'+MODES[S.mode].name+' · '+MODES[S.mode].sub+'. Hier siehst du dann live, was auf den Boards passiert.</p></div>';
  var recent=ev.matches.filter(function(m){return m.status==='done';}).slice(-5).reverse();
  return '<div class="grid" style="gap:20px">'+modeBar(ev)+(ev.phase==='done'?'<div class="grid g2"><section class="panel">'+recap(ev)+'</section><section class="panel"><h3>Siegerehrung</h3>'+ceremonyList(ev,podium(ev))+'</section></div>':'')+
    '<div class="grid '+(ev.boards.length>2?'g3':'g2')+'">'+ev.boards.map(function(_,b){return boardCard(ev,b);}).join('')+'</div>'+
    '<div class="grid g2"><section class="panel"><h3>Highlights des Abends</h3>'+hlList(ev)+'</section>'+
    '<section class="panel"><h3>Als Nächstes</h3>'+queue(ev,3)+'<h3 style="margin-top:16px">Zuletzt gespielt</h3>'+(recent.length?'<ul class="mlist">'+recent.map(function(m){return mItem(ev,m);}).join('')+'</ul>':'<p class="muted" style="margin:0">Noch kein Match beendet.</p>')+'</section></div>'+
    '<div class="grid g3">'+groupTables(ev)+'<div class="panel"><h3>K.-o.-Runde</h3>'+koList(ev)+'</div></div>'+
    '<section class="panel"><h3>Statistik heute</h3><div class="tbl-wrap">'+statTable([ev],MD(ev).kind==='cricket')+'</div></section></div>';
}

/* --- Saison --- */
function seasonEvs(){return S.season==='all'?ARCHIVE.slice():ARCHIVE.filter(function(e){return e.season===S.season;});}
function seasons(){var o={};o[CUR_SEASON]=1;ARCHIVE.forEach(function(e){o[e.season]=1;});return Object.keys(o).sort().reverse();}
function seasonLabel(s){return s==='2026'?'Simulation 2026 (ausgedacht)':'Masters-Saison '+s;}
function seasonSelect(){return '<div class="sbar"><label for="ssel" class="muted">Saison</label><select id="ssel" data-season="1">'+seasons().map(function(s){return '<option value="'+s+'"'+(S.season===s?' selected':'')+'>'+seasonLabel(s)+'</option>';}).join('')+'<option value="all"'+(S.season==='all'?' selected':'')+'>Alle Saisons (ewig)</option></select>'+(SITE?'':'<span class="muted" style="font-size:.82rem">„Simulation 2026“ ist eine komplett ausgedachte Saison zum Anschauen. 2027 ist die echte Saison, sie beginnt am 07.01.2027.</span>')+'</div>';}
var LBINFO={'CDA-Rating':'Wertung nach dem Elo-Prinzip: Jeder startet mit 1.500. Wer gewinnt, bekommt Punkte vom Gegner, gegen Stärkere mehr als gegen Schwächere. Zeigt die aktuelle Spielstärke, unabhängig davon, wie oft jemand da war.','Average (501)':'Durchschnittliche Punkte pro Aufnahme (3 Darts) in allen 501-Spielen der Saison. Gewertet ab 90 geworfenen Darts.','Hold-Quote':'Anteil der Legs, die ein Spieler gewinnt, wenn er selbst anwirft. Wer den eigenen Anwurf sicher durchbringt, hat eine hohe Hold-Quote.','Break-Quote':'Anteil der Legs, die ein Spieler gewinnt, obwohl der Gegner anwirft. Eine hohe Break-Quote heißt: Er holt auch Legs, in denen er hinten liegt.','Clutch: Decider gewonnen':'Der Decider ist das entscheidende Leg bei 1:1 (Best of 3) oder 2:2 (Best of 5). Gezeigt wird, wie viele davon jemand gewinnt. Gewertet ab 3 Decidern.','180er':'Anzahl der geworfenen 180er in der Saison, in allen Spielmodi.'};
function lbCard(title,ids,val,fmt){var inf=LBINFO[title];return '<div class="lb"><div class="lbh"><h4>'+title+'</h4>'+(inf?'<details class="inf"><summary aria-label="Was bedeutet '+title+'?" title="Was bedeutet das?">i</summary><p>'+inf+'</p></details>':'')+'</div><ol>'+ids.slice(0,5).map(function(id,i){return '<li><i>'+(i+1)+'</i><span>'+plink(id)+'</span><b>'+fmt(val(id))+'</b></li>';}).join('')+'</ol></div>';}
function viewSeason(){
  var evs=seasonEvs(),ms=evs.filter(function(e){return MODES[e.mode].masters;});
  var MT=mastersTable(evs),st=stats(ms),rk=Object.keys(MT).map(function(k){return MT[k];}).sort(function(a,b){return b.pts-a.pts||b.wins-a.wins;});
  var fev=evs.filter(function(e){return MODES[e.mode].finals;})[0],fpl={};
  if(fev){var fpc=placements(fev);Object.keys(fpc).forEach(function(k){fev.parts[k].members.forEach(function(pid){fpl[pid]=fpc[k];});});}
  var top=rk.length?rk[0].pts:1,qn=0,cut=-1,lastQ=-1;
  rk.forEach(function(r,i){if(r.n>=MIN_QUALI&&!pl(r.pid).guest){qn++;lastQ=i;if(qn===MAX_FINALS)cut=i;}});
  var full=cut>=0;if(!full)cut=lastQ;var inF={};qn=0;rk.forEach(function(r){if(r.n>=MIN_QUALI&&!pl(r.pid).guest&&++qn<=MAX_FINALS)inF[r.pid]=1;});
  var pips=function(n,g){var o='';for(var k=1;k<=MASTERS_PER_SEASON;k++)o+='<i class="'+(k<=n?'on':k<=MIN_QUALI&&!g?'need':'')+'"></i>';return '<span class="pips" title="'+n+' von '+MASTERS_PER_SEASON+' Masters-Abenden">'+o+'</span>';};
  var rankT='<table class="rank rank2"><thead><tr><th>#</th><th>Spieler</th><th>Punkte</th><th>Abende</th><th>Finals</th><th>Siege</th><th>Preisgeld</th><th>Avg</th></tr></thead><tbody>'+rk.map(function(r,i){
    var g=pl(r.pid).guest;
    var q=fev?(fpl[r.pid]?'<span class="qchip ok">'+fpl[r.pid].place+'. Platz</span>':g?'<span class="qchip no">Gast</span>':r.n>=MIN_QUALI?'<span class="qchip no">nicht dabei</span>':'<span class="qchip no">nicht quali.</span>')
      :g?'<span class="qchip no">Gast</span>':inF[r.pid]?'<span class="qchip ok">✓ Finals</span>':r.n>=MIN_QUALI?'<span class="qchip out">über Platz 32</span>':'<span class="qchip no">noch '+(MIN_QUALI-r.n)+' Abend'+(MIN_QUALI-r.n>1?'e':'')+'</span>';
    var row='<tr class="'+(i<3?'t'+(i+1):'')+(inF[r.pid]&&!fev?' inf':'')+'"><td><span class="rk">'+(i+1)+'</span></td><td>'+plink(r.pid)+'</td>'+
      '<td><span class="ptc"><b>'+r.pts+'</b><span class="pb"><i style="width:'+Math.round(r.pts/top*100)+'%"></i></span></span></td>'+
      '<td><span class="abc">'+pips(r.n,g)+'<b>'+r.n+'</b></span></td><td>'+q+'</td><td>'+(r.wins||'–')+'</td><td class="mon">'+(r.money?eur(r.money):'–')+'</td><td>'+fmt2(avgOf(st[r.pid]))+'</td></tr>';
    if(i===cut)row+='<tr class="cutrow"><td colspan="8"><span>'+(fev?'Finals-Grenze · '+fev.pids.length+' Spieler waren dabei (max. '+MAX_FINALS+')':full?'Finals-Grenze · die besten '+MAX_FINALS+' mit mindestens '+MIN_QUALI+' Abenden':'Finals-Grenze · max. '+MAX_FINALS+' Spieler · aktuell '+qn+' qualifiziert, alle wären dabei')+'</span></td></tr>';
    return row;}).join('')+'</tbody></table>';
  /* Pott */
  var pot=sum(ms.map(function(e){return e.pids.length*POT_FEE;})),proj=MASTERS_PER_SEASON*15*POT_FEE,fp=payout(pot,FIN_SPLIT);
  var potH='<div class="pot"><span class="pv num">'+eur(pot)+'</span><span class="pd">im Masters-Pott nach <b>'+ms.length+' von '+MASTERS_PER_SEASON+'</b> Masters-Abenden.<br>Hochgerechnet bei 15 Spielern im Schnitt: <b>'+eur(proj)+'</b> zum Saisonende.</span><div class="pbar"><i style="width:'+Math.min(100,Math.round(pot/proj*100))+'%"></i></div>'+
    '<div class="split">'+FIN_SPLIT.map(function(p,i){return '<span>'+(i+1)+'. Platz <b>'+Math.round(p*100)+' %</b> · aktuell '+eur(fp[i])+'</span>';}).join('')+'</div></div>';
  /* Plan */
  var sched='',up=cal(CUR_SEASON).filter(function(x){return x.date>=TONIGHT;}).slice(0,12);
  up.forEach(function(x){var md=MODES[x.mode];sched+='<div class="'+(md.masters||md.finals?'ms':x.mode==='c501'||x.mode==='di301'?'':'sp')+(x.date===TONIGHT?' today':'')+'"><span>'+(md.finals?'Sa ':'Do ')+dshort(x.date)+(x.date===TONIGHT?' · heute':'')+'</span><b>'+md.name+'</b>'+(x.note?'<span>'+x.note+'</span>':'')+'</div>';});
  /* Bestenlisten */
  var D=deep(evs),RT=ratings(evs),sa=stats(evs);
  var TW={};evs.forEach(function(ev){var p0=podium(ev)[0];if(p0&&ev.parts[p0.part])ev.parts[p0.part].members.forEach(function(pid){TW[pid]=(TW[pid]||0)+1;});});
  var withLegs=Object.keys(D).map(Number).filter(function(id){return D[id].hs+D[id].bs>=8;});
  var rIds=Object.keys(RT.R).map(Number).sort(function(a,b){return RT.R[b]-RT.R[a];});
  var by=function(f){return withLegs.slice().filter(function(id){return f(id)!=null;}).sort(function(a,b){return f(b)-f(a);});};
  var lbs=lbCard('CDA-Rating',rIds,function(id){return RT.R[id];},function(v){return Math.round(v).toLocaleString('de-DE');})+
    lbCard('Average (501)',Object.keys(sa).map(Number).filter(function(id){return sa[id].dt>=90;}).sort(function(a,b){return avgOf(sa[b])-avgOf(sa[a]);}),function(id){return avgOf(sa[id]);},fmt2)+
    lbCard('Hold-Quote',by(function(id){return D[id].hold;}),function(id){return D[id].hold;},pct)+
    lbCard('Break-Quote',by(function(id){return D[id].brk;}),function(id){return D[id].brk;},pct)+
    lbCard('Clutch: Decider gewonnen',withLegs.filter(function(id){return D[id].dec>=3;}).sort(function(a,b){return D[b].decq-D[a].decq||D[b].dec-D[a].dec;}),function(id){return D[id];},function(x){return pct(x.decq)+' <i>('+x.decw+'/'+x.dec+')</i>';})+
    lbCard('Turniersiege (alle Modi)',Object.keys(TW).map(Number).sort(function(a,b){return TW[b]-TW[a];}),function(id){return TW[id];},String)+
    lbCard('180er',Object.keys(sa).map(Number).filter(function(id){return sa[id].t180;}).sort(function(a,b){return sa[b].t180-sa[a].t180;}),function(id){return sa[id].t180;},String);
  /* Rekorde, Archiv, Duell, Statistik (wie bisher) */
  var evAll=evs.slice().reverse(),evShown=S.showAll?evAll:evAll.slice(0,12);
  var evc=evShown.map(function(ev){var pd=podium(ev),md=MODES[ev.mode];
    return '<div class="evc '+(md.masters?'ms':'sp')+'"><span class="ed">'+wdS(ev.date)+' '+dshort(ev.date)+' · '+ev.pids.length+' Spieler'+(md.masters?' · '+eur(ev.pids.length*DAY_FEE)+' Preisgeld':'')+'</span><span class="en">'+md.name+'</span><span class="ew">Sieg: <b>'+partH(ev,pd[0].part)+'</b></span><span class="ed">2. '+esc(partN(ev,pd[1].part))+(pd[2]?' · 3. '+esc(partN(ev,pd[2].part)):'')+'</span></div>';}).join('');
  var ids=Object.keys(sa).map(Number),k=S.sort.k,d=S.sort.d;
  var val={name:function(x,id){return pn(id);},ev:function(x){return x.ev;},sp:function(x){return x.sp;},q:function(x){return x.sp?x.w/x.sp:0;},tw:function(x,id){return TW[id]||0;},avg:function(x){return avgOf(x);},t180:function(x){return x.t180;},t171:function(x){return x.t171;},sl:function(x){return x.sl;},hf:function(x){return x.hf;},best:function(x){return x.best||999;},mpr:function(x){return mprOf(x);}};
  ids.sort(function(a,b){var va=val[k](sa[a],a),vb=val[k](sa[b],b);return (va>vb?1:va<vb?-1:0)*d;});
  var cl=[['name','Spieler'],['ev','Abende'],['sp','Matches'],['q','Match-Siege'],['tw','Turniersiege'],['avg','Avg'],['t180','180'],['t171','171+'],['sl','Short Legs'],['hf','High Finish'],['best','Bestes Leg'],['mpr','MPR']];
  var thead='<tr><th>#</th>'+cl.map(function(c){return '<th class="sort'+(c[0]===k?' sorted':'')+'" data-act="sort" data-k="'+c[0]+'">'+c[1]+(c[0]===k?(d<0?' ↓':' ↑'):'')+'</th>';}).join('')+'</tr>';
  var tbody=ids.map(function(id,i){var x=sa[id];return '<tr><td>'+(i+1)+'</td><td>'+plink(id)+'</td><td>'+x.ev+'</td><td>'+x.sp+'</td><td>'+(x.sp?Math.round(x.w/x.sp*100)+' %':'–')+'</td><td>'+(TW[id]?'<b>'+TW[id]+'</b> 🏆':'–')+'</td><td>'+fmt2(avgOf(x))+'</td><td>'+(x.t180||'–')+'</td><td>'+(x.t171||'–')+'</td><td>'+(x.sl||'–')+'</td><td>'+(x.hf||'–')+'</td><td>'+(x.best?x.best:'–')+'</td><td>'+fmt2(mprOf(x))+'</td></tr>';}).join('');
  return '<div class="grid" style="gap:20px">'+seasonSelect()+
    (fev?'<div class="grid g2"><section class="panel"><h3>Masters-Finals · '+dshort(fev.date)+fev.date.slice(0,4)+' · TSV Dinkelscherben</h3>'+recap(fev)+'</section><section class="panel"><h3>Ausgezahlt aus dem Pott: '+eur(potFor(fev.season))+'</h3>'+ceremonyList(fev,podium(fev))+'<p class="cap">'+fev.pids.length+' qualifizierte Spieler (mindestens '+MIN_QUALI+' Masters-Abende) · '+fev.plan.txt+'. Der Pott kam aus '+ms.length+' Masters-Abenden mit im Schnitt '+fmt1(sum(ms.map(function(e){return e.pids.length;}))/ms.length)+' Spielern.</p></section></div>':'')+
    (fev?'':'<div class="grid g2"><section class="panel"><h3>Masters-Pott</h3>'+potH+'</section>')+(fev?'':'<section class="panel"><h3>Spielplan nach Rotation</h3><div class="sched">'+sched+'</div><p class="cap">Saison = Kalenderjahr ab 07.01. Alle 3 Wochen Masters (16 pro Saison), dazwischen 501 und 301 Double-In. Cricket etwa alle 7 Wochen, Lucky Doubles alle 12, Bring a Friend zum Saisonstart und alle 4 Monate. In der Finals-Woche kein Masters, Finals am Samstag beim TSV. Pause vom 23.12. bis 6.1.</p></section></div>')+
    '<section class="panel"><div class="row" style="justify-content:space-between;align-items:baseline"><h2 style="margin:0">CDA-Masters-Rangliste</h2><span class="muted" style="font-size:.85rem">'+ms.length+' von '+MASTERS_PER_SEASON+' Masters-Abenden · Finals: die besten '+MAX_FINALS+' mit mindestens '+MIN_QUALI+' Abenden</span></div>'+
    '<p class="muted" style="font-size:.85rem;margin:6px 0 12px">Punkte pro Abend: 5 fürs Mitspielen, 2 für jeden Spieler, der hinter dir landet, 1 pro gewonnenem Match, dazu Bonus +10 / +6 / +3 für die Plätze 1 bis 3. Es zählen die besten '+BEST_OF+' Abende. Namen antippen öffnet das Spielerprofil.</p><div class="tbl-wrap">'+rankT+'</div></section>'+
    '<section class="panel"><h3>Bestenlisten der Saison</h3><div class="lbs">'+lbs+'</div><p class="cap">Hold, Break und Clutch zählen nur Einzel-Legs in 501.</p></section>'+
    '<section class="panel"><h3>Alle Abende ('+evAll.length+')</h3><div class="evlist">'+evc+'</div>'+(evAll.length>12?'<div class="row" style="margin-top:12px"><button class="btn small" data-act="showall">'+(S.showAll?'Nur die letzten 12 zeigen':'Alle '+evAll.length+' Abende zeigen')+'</button></div>':'')+'</section>'+
    '<section class="panel"><h3>Spielerstatistik</h3><p class="muted" style="font-size:.85rem;margin:-4px 0 10px">Alle Modi. Auf eine Spalte tippen, um danach zu sortieren.</p><div class="tbl-wrap"><table><thead>'+thead+'</thead><tbody>'+tbody+'</tbody></table></div></section></div>';
}

/* --- Spielerprofil --- */
var NS='http://www.w3.org/2000/svg';
function sv(w,h,inner){return '<svg viewBox="0 0 '+w+' '+h+'" role="img">'+inner+'</svg>';}
function t(x,y,s,o){o=o||{};return '<text x="'+x+'" y="'+y+'" text-anchor="'+(o.a||'start')+'" font-size="'+(o.fs||12)+'" style="fill:'+(o.fill||'var(--muted)')+';font-family:var(--f-body);'+(o.w?'font-weight:'+o.w:'')+'">'+s+'</text>';}
function radar(ax){
  var cx=150,cy=140,R=90,n=ax.length,s='';function pt(i,r){var a=-Math.PI/2+i*2*Math.PI/n;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r];}
  [25,50,75,100].forEach(function(v){s+='<polygon points="'+ax.map(function(_,i){return pt(i,R*v/100).join(',');}).join(' ')+'" style="fill:none;stroke:var(--line)" stroke-width="'+(v===50?1.5:1)+'" '+(v===50?'stroke-dasharray="4 3"':'')+'/>';});
  ax.forEach(function(_,i){var p=pt(i,R);s+='<line x1="'+cx+'" y1="'+cy+'" x2="'+p[0]+'" y2="'+p[1]+'" style="stroke:var(--line)"/>';});
  s+='<polygon points="'+ax.map(function(a,i){return pt(i,R*Math.max(4,a[1])/100).join(',');}).join(' ')+'" style="fill:color-mix(in srgb,var(--green) 25%,transparent);stroke:var(--green-ink)" stroke-width="2.5" stroke-linejoin="round"/>';
  ax.forEach(function(a,i){var p=pt(i,R*Math.max(4,a[1])/100),q=pt(i,R+16),an=Math.abs(q[0]-cx)<5?'middle':q[0]>cx?'start':'end',dy=q[1]<cy-10?-2:q[1]>cy+10?10:4;
    s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="3.5" style="fill:var(--green-ink)"/>'+t(q[0],q[1]+dy,a[0],{a:an,fs:11.5,fill:'var(--ink)',w:600})+t(q[0],q[1]+dy+14,a[1]==null?'–':Math.round(a[1]),{a:an,fs:11,fill:'var(--green-ink)',w:700});});
  return sv(300,280,s);
}
function spark(vals,club){
  if(vals.length<2)return '<p class="muted">Noch zu wenige Abende für eine Formkurve.</p>';
  var x0=10,x1=290,y0=96,y1=14,mn=Math.min.apply(null,vals.concat([club]))-3,mx=Math.max.apply(null,vals.concat([club]))+3;
  function X(i){return x0+i*(x1-x0)/(vals.length-1);}function Y(a){return y0-(a-mn)/(mx-mn)*(y0-y1);}
  var d=vals.map(function(a,i){return(i?'L':'M')+X(i).toFixed(1)+' '+Y(a).toFixed(1);}).join(' '),li=vals.length-1;
  return sv(300,110,'<line x1="'+x0+'" x2="'+x1+'" y1="'+Y(club)+'" y2="'+Y(club)+'" style="stroke:var(--muted)" stroke-dasharray="4 4"/><path d="'+d+' L'+X(li)+' '+y0+' L'+x0+' '+y0+' Z" style="fill:color-mix(in srgb,var(--green) 16%,transparent)"/><path d="'+d+'" style="fill:none;stroke:var(--green-ink)" stroke-width="2.5" stroke-linejoin="round"/><circle cx="'+X(li)+'" cy="'+Y(vals[li])+'" r="5" style="fill:var(--green-ink)"/>'+t(X(li)-8,Y(vals[li])-10,fmt1(vals[li]),{a:'end',fs:13,fill:'var(--ink)',w:700}));
}
function eloChart(h){
  if(!h||h.length<2)return '';var x0=46,x1=290,y0=100,y1=12,vs=h.map(function(x){return x.r;}),mn=Math.min.apply(null,vs.concat([1500]))-15,mx=Math.max.apply(null,vs.concat([1500]))+15;
  function X(i){return x0+i*(x1-x0)/(h.length-1);}function Y(a){return y0-(a-mn)/(mx-mn)*(y0-y1);}
  var d=vs.map(function(a,i){return(i?'L':'M')+X(i).toFixed(1)+' '+Y(a).toFixed(1);}).join(' ');
  return sv(300,112,'<line x1="'+x0+'" x2="'+x1+'" y1="'+Y(1500)+'" y2="'+Y(1500)+'" style="stroke:var(--line)"/>'+t(x0-6,Y(1500)+4,'1.500',{a:'end',fs:10.5})+'<path d="'+d+'" style="fill:none;stroke:var(--gold)" stroke-width="2.5"/><circle cx="'+X(vs.length-1)+'" cy="'+Y(vs[vs.length-1])+'" r="4.5" style="fill:var(--gold)"/>'+t(X(vs.length-1)-8,Y(vs[vs.length-1])-9,Math.round(vs[vs.length-1]).toLocaleString('de-DE'),{a:'end',fs:13,fill:'var(--ink)',w:700}));
}
var BCOL=['var(--red)','color-mix(in srgb,var(--red) 45%,var(--panel-2))','var(--line)','color-mix(in srgb,var(--green) 45%,var(--panel-2))','var(--green)','var(--gold)'];
function stackBar(arr,label,y){var tot=sum(arr)||1,x=110,w=520,s=t(0,y+17,label,{fs:12.5,fill:'var(--ink)',w:600});arr.forEach(function(v,k){var ww=v/tot*w;s+='<rect x="'+x.toFixed(1)+'" y="'+y+'" width="'+Math.max(0,ww-1.5).toFixed(1)+'" height="24" style="fill:'+BCOL[k]+'"/>';var p=Math.round(v/tot*100);if(p>=7)s+=t((x+ww/2).toFixed(1),y+16,p+' %',{a:'middle',fs:11,fill:k===0||k===4||k===5?'#fff':'var(--ink)',w:600});x+=ww;});return s;}
function legHist(me,club){
  var x0=28,x1=630,y0=160,y1=10,mx=Math.max.apply(null,me.concat(club.map(function(c){return c;})))||1,bw=(x1-x0)/LEGB.length,s='';
  function Y(v){return y0-v/mx*(y0-y1);}
  LEGB.forEach(function(l,i){var x=x0+i*bw;s+='<rect x="'+(x+bw*.14)+'" y="'+Y(club[i])+'" width="'+bw*.34+'" height="'+(y0-Y(club[i]))+'" rx="2" style="fill:color-mix(in srgb,var(--muted) 40%,transparent)"/><rect x="'+(x+bw*.52)+'" y="'+Y(me[i])+'" width="'+bw*.34+'" height="'+(y0-Y(me[i]))+'" rx="2" style="fill:var(--green)"/>'+(me[i]?t(x+bw*.69,Y(me[i])-5,me[i],{a:'middle',fs:11.5,fill:'var(--ink)',w:700}):'')+t(x+bw/2,y0+17,l[2],{a:'middle',fs:11.5,fill:'var(--ink)'});});
  var xs=x0+2*bw;s+='<line x1="'+xs+'" x2="'+xs+'" y1="'+y1+'" y2="'+y0+'" style="stroke:var(--gold)" stroke-width="2" stroke-dasharray="5 4"/>'+t(xs-6,y1+12,'Short Legs',{a:'end',fs:11.5,fill:'var(--gold)',w:700});
  return sv(640,186,s);
}
function viewProfile(pid){
  var p=pl(pid),evs=seasonEvs(),D=deep(evs),RT=ratings(evs),sa=stats(evs),MT=mastersTable(evs),x=sa[pid]||blank(),d=D[pid];
  var rk=Object.keys(MT).map(function(k){return MT[k];}).sort(function(a,b){return b.pts-a.pts;}),rank=rk.findIndex(function(r){return r.pid===pid;})+1;
  var hist=RT.hist[pid]||[],rNow=RT.R[pid]||1500,rPrev=hist.length>1?hist[hist.length-2].r:1500;
  var form=d?d.form.map(function(f){return f.avg;}):[],club=(function(){var s=0,dd=0;Object.keys(sa).forEach(function(k){s+=sa[k].sc;dd+=sa[k].dt;});return dd?s/dd*3:0;})();
  /* Prozentränge */
  var pool=Object.keys(D).map(Number).filter(function(id){return D[id].hs+D[id].bs>=6;});
  function prank(f,low){var arr=pool.map(function(id){return f(id);}).filter(function(v){return v!=null&&!isNaN(v);}),v=f(pid);if(v==null||isNaN(v)||arr.length<2)return null;var below=arr.filter(function(a){return low?a>v:a<v;}).length;return below/(arr.length-1)*100;}
  var ax=[['Scoring',prank(function(id){return avgOf(sa[id]);})],['Start (First 9)',prank(function(id){return D[id].f9;})],['Finish',prank(function(id){return D[id].fin;},true)],['Anwurf',prank(function(id){return D[id].hold;})],['Nerven',prank(function(id){return D[id].decq;})],['Konstanz',prank(function(id){return D[id].sd||null;},true)]];
  /* Abzeichen */
  var guests=ARCHIVE.reduce(function(a,ev){ev.pids.forEach(function(g){if(pl(g).by===pid)a[g]=(a[g]||0)+1;});return a;},{});
  var wonM=evs.some(function(ev){return MODES[ev.mode].masters&&ev.phase==='done'&&podium(ev)[0]&&ev.parts[podium(ev)[0].part].members.indexOf(pid)>=0;});
  var bad=[['1','var(--green)','Erster Abend',x.ev>=1],['180','var(--gold)','Ton-80-Club',x.t180>0],['100+','var(--red)','Big Finish',x.hf>=100],['170','var(--gold)','Big Fish',x.hf===170],['15','var(--green-ink)','Turbo-Leg',x.best&&x.best<=15],['★','var(--gold)','Masters-Sieger',wonM],['♥','#ff8a92','Bring a Friend',Object.keys(guests).some(function(g){return guests[g]>1;})],[evs.length+'/'+evs.length,'var(--green-ink)','Eisern',x.ev===evs.length]];
  var badges=bad.map(function(b){return '<span class="badge'+(b[3]?'':' off')+'"><i style="background:'+b[1]+'">'+b[0]+'</i>'+b[2]+'</span>';}).join('');
  /* Vereinsschnitt */
  var clubD=Object.keys(D).reduce(function(a,id){var y=D[id];a.hs+=y.hs;a.hw+=y.hw;a.bs+=y.bs;a.bw+=y.bw;y.bk.forEach(function(v,i){a.bk[i]+=v;});y.legs.forEach(function(v,i){a.legs[i]+=v;});return a;},{hs:0,hw:0,bs:0,bw:0,bk:[0,0,0,0,0,0],legs:[0,0,0,0,0,0,0]});
  var clubH=clubD.hs?clubD.hw/clubD.hs:0,clubB=clubD.bs?clubD.bw/clubD.bs:0,nP=Object.keys(D).length||1;
  var clubLegs=clubD.legs.map(function(v){return Math.round(v/nP*10)/10;});
  function hbRow(lbl,v,cv,col){return '<div class="hbrow"><span>'+lbl+'</span><span class="tr"><i style="width:'+Math.round((v||0)*100)+'%;background:'+col+'"></i><u style="left:'+Math.round(cv*100)+'%"></u></span><b class="num">'+pct(v)+'</b></div>';}
  var evRows=evs.slice().reverse().filter(function(ev){return ev.pids.indexOf(pid)>=0;}).map(function(ev){var pd=podium(ev),me=pd.filter(function(z){return ev.parts[z.part].members.indexOf(pid)>=0;})[0],s1=stats([ev])[pid]||blank();
    return '<li><span class="d">'+wdS(ev.date)+' '+dshort(ev.date)+'</span><span>'+MODES[ev.mode].name+'</span><span class="x muted num">'+(MODES[ev.mode].kind==='cricket'?fmt2(mprOf(s1))+' MPR':'Ø '+fmt2(avgOf(s1)))+(me&&me.money?' · '+eur(me.money):'')+'</span><span class="pl">'+(me?me.place+'.':'–')+'</span></li>';}).join('');
  var ini=p.name.split(' ').map(function(s){return s[0];}).join('').slice(0,2);
  return '<div class="grid" style="gap:16px"><div class="row" style="justify-content:space-between"><button class="btn small" data-act="back">← Zurück zur Saison</button>'+seasonSelect()+'</div>'+
    '<section class="panel"><div class="prof-head"><div class="ph">'+(PHOTO[pid]?'<img src="'+PHOTO[pid]+'" alt="Foto von '+esc(p.name)+'">':'<span class="ini">'+ini+'</span>')+'</div><div class="pinfo">'+
      '<span class="nick">'+(NICK[pid]?'„'+NICK[pid]+'“ · ':'')+(p.guest?'Gast':'CDA '+p.team)+'</span><span class="pname">'+esc(p.name.replace(' (Gast)',''))+'</span>'+
      '<div class="kpis"><div class="kpi"><span>CDA-Rating</span><b class="num">'+Math.round(rNow).toLocaleString('de-DE')+'</b><em class="'+(rNow>=rPrev?'up':'down')+'">'+(rNow>=rPrev?'▲ ':'▼ ')+Math.abs(Math.round(rNow-rPrev))+' letzter Abend</em></div>'+
      '<div class="kpi"><span>Saison-Avg</span><b class="num">'+fmt2(avgOf(x))+'</b><em class="muted">First 9: '+(d?fmt2(d.f9):'–')+'</em></div>'+
      '<div class="kpi"><span>Masters-Rang</span><b class="num">'+(rank?rank+'.':'–')+'</b><em class="muted">'+(MT[pid]?MT[pid].pts+' Punkte · '+MT[pid].n+' Masters-Abende':'noch kein Masters-Abend')+'</em></div>'+
      '<div class="kpi"><span>Preisgeld</span><b class="num">'+(MT[pid]&&MT[pid].money?eur(MT[pid].money):'–')+'</b><em class="muted">'+x.ev+' Abende · '+x.sp+' Matches</em></div></div>'+
      '<div class="badges">'+badges+'</div></div></div></section>'+
    '<div class="grid g2"><section class="panel vis"><h3>Darts-DNA</h3>'+radar(ax)+'<p class="cap">Vergleich mit allen Spielern der Saison: 100 = Bester im CDA, 50 = Vereinsmitte (gestrichelt).</p></section>'+
      '<section class="panel vis"><h3>Form: Average pro Abend</h3>'+spark(form,club)+'<p class="cap">Gestrichelt: Vereinsschnitt '+fmt1(club)+'</p><h3 style="margin-top:14px">CDA-Rating im Verlauf</h3>'+eloChart(hist)+'</section></div>'+
    '<div class="grid g2"><section class="panel"><h3>Hold &amp; Break</h3>'+(d?'<div class="hb">'+hbRow('Hold',d.hold,clubH,'var(--green)')+hbRow('Break',d.brk,clubB,'var(--red)')+'</div><p class="cap">Hold: eigene Anwurf-Legs gewonnen ('+d.hw+'/'+d.hs+'). Break: Anwurf-Legs des Gegners geholt ('+d.bw+'/'+d.bs+'). Der Strich zeigt den Vereinsschnitt.</p>':'<p class="muted">Noch keine Einzel-Legs in 501.</p>')+'</section>'+
      '<section class="panel"><h3>Clutch</h3>'+(d?'<div class="bignum"><div><b class="num">'+pct(d.decq)+'</b><span>Decider gewonnen ('+d.decw+'/'+d.dec+')</span></div><div><b class="num">'+d.cb+'</b><span>Matches nach 0:1 gedreht (von '+d.cbn+')</span></div></div><p class="cap">Decider = das entscheidende Leg bei 1:1 (Best of 3) oder 2:2 (Best of 5).</p>':'<p class="muted">Noch keine Daten.</p>')+'</section></div>'+
    '<section class="panel vis"><h3>Scoring-Profil: Anteil der Aufnahmen</h3><div class="lg2">'+BUCK.map(function(b,i){return '<span><i style="background:'+BCOL[i]+'"></i>'+b[2]+'</span>';}).join('')+'</div>'+(d?sv(640,70,stackBar(d.bk,esc(p.name.split(' ')[0]),4)+stackBar(clubD.bk,'Verein',40)):'')+'</section>'+
    '<section class="panel vis"><h3>Leg-Längen: gewonnene 501-Legs nach Darts</h3><div class="lg2"><span><i style="background:var(--green)"></i>'+esc(p.name.split(' ')[0])+'</span><span><i style="background:color-mix(in srgb,var(--muted) 40%,transparent)"></i>Schnitt pro Spieler</span></div>'+(d?legHist(d.legs,clubLegs):'')+'</section>'+
    '<section class="panel"><h3>Alle Abende der Saison</h3><ul class="evrows">'+(evRows||'<li class="muted">Noch nicht dabei gewesen.</li>')+'</ul></section></div>';
}

/* ================= Bedienung ================= */
function key(b,k){
  var ev=S.ev,m=byId(ev,ev.boards[b]);if(!m)return;
  if(!m.started){if(k==='Enter')m.started=true;return;}
  if(m.over){if(k==='Enter')commit(ev,b);return;}
  var cr=MD(ev).kind==='cricket',inp=S.input[b]||'';
  if(!cr&&ev.ask[b]){var d=+k;if(d>=ev.ask[b].min&&d<=3)S.msg[b]=checkoutX(ev,b,d);else if(k==='Escape')undo(ev,b);return;}
  if(cr){
    if(/^[tdsTDS]$/.test(k)){S.input[b]=k.toUpperCase();return;}
    if(/^\d$/.test(k)){if(inp.replace(/\D/g,'').length<2)S.input[b]=inp+k;return;}
    if(k==='Backspace'){S.input[b]=inp.slice(0,-1);return;}
    if(k==='Enter'){S.input[b]='';if(inp===''){S.msg[b]=cEnd(ev,b,false);return;}
      var mul=inp[0]==='T'?3:inp[0]==='D'?2:1,n=+inp.replace(/\D/g,'');if(n===50){n=25;mul=2;}
      if(n===0){S.msg[b]=cDart(ev,b,0,0);return;}
      if(CNUM.indexOf(n)<0){S.msg[b]='err:'+n+' zählt im Cricket nicht.';return;}
      S.msg[b]=cDart(ev,b,n,mul);}
    return;
  }
  if(/^\d$/.test(k)){if(inp.length<3)S.input[b]=inp+k;S.msg[b]='';}
  else if(k==='Backspace')S.input[b]=inp.slice(0,-1);
  else if(k==='Enter'){if(inp==='')return;S.msg[b]=submitX(ev,b,inp);S.input[b]='';}
  else if(k==='Rest'){if(inp==='')return;var lg=curLeg(m),r=restX(ev,m,lg,turn(lg)),left=+inp;S.input[b]='';
    if(left>=r){S.msg[b]='err:Restscore '+left+' muss kleiner sein als der aktuelle Rest ('+r+').';return;}
    if(left===1){S.msg[b]='err:Rest 1 geht nicht, das wäre überworfen.';return;}
    S.msg[b]=submitX(ev,b,String(r-left));}
}
function top(){if(SITE){var h=CFG.host;if(h&&h.getBoundingClientRect().top<0)h.scrollIntoView();}else window.scrollTo(0,0);}
var LT=SITE?DOC:document;
LT.addEventListener('click',function(e){
  var tb=e.target.closest('[data-tab]');if(tb){var tv=tb.getAttribute('data-tab');if(tv==='logout'){authLogout();S.live=false;S.ev=SIM_EV;SV.gateLoaded=false;}if(tv==='logout'||tv==='gate'){S.role=null;S.login={};tv='gate';}S.view=tv;render();window.scrollTo(0,0);return;}
  var t=e.target.closest('[data-act]');if(!t||t.disabled)return;
  var a=t.getAttribute('data-act'),b=+t.getAttribute('data-b');
  var res=liveRun(isNaN(b)?null:b,function(){return doAct(t,a,b);});
  if(res!=='stop')render();
});
function doAct(t,a,b){
  var ev=S.ev;
  if(S.live&&!(ev&&ev.test)&&(a==='reset'||a==='sim'||a==='simall'||a==='simv'))return;
  if(S.live&&a==='reset'){ /* Testabend: komplett löschen und neu beginnen */
    if(S.role!=='lead')return 'stop';
    if(!confirm('Testabend vom '+ev.date.split('-').reverse().join('.')+' löschen? Alle Ergebnisse dieses Abends gehen verloren.'))return 'stop';
    fetch(SBU+'/rest/v1/rpc/cda_delete_test_event',{method:'POST',headers:hdr(true),body:JSON.stringify({p_date:ev.date})})
      .then(function(r){if(!r.ok)throw new Error('Löschen fehlgeschlagen ('+r.status+')');SV.pending=[];SV.rev=0;SV.gate=null;SV.gateLoaded=false;S.view='lead';return enterLive();})
      .catch(function(x){SV.err=x.message;render();});
    return 'stop';}
  if(a==='toggle'){var id=+t.getAttribute('data-id');S.checked[id]=!S.checked[id];}
  else if(a==='mode'){S.mode=t.getAttribute('data-m');S.legs.custom=null;ev.mode=S.mode;if(MODES[S.mode].finals){S.venue='tsv';S.boards=VENUES.tsv.boards.slice();}}
  else if(a==='venue'){S.venue=t.getAttribute('data-v');S.boards=VENUES[S.venue].boards.slice();}
  else if(a==='bplus'){if(S.boards.length<12)S.boards.push(S.boards[S.boards.length-1]||'pc');S.venue='custom';}
  else if(a==='bminus'){if(S.boards.length>1)S.boards.pop();S.venue='custom';}
  else if(a==='btype'){var i=+t.getAttribute('data-i');S.boards[i]=S.boards[i]==='pc'?'tablet':'pc';S.venue='custom';}
  else if(a==='selq'){var mt=mastersTable(ARCHIVE.filter(function(x){return x.season===CUR_SEASON;}));if(!Object.keys(mt).length)mt=mastersTable(ARCHIVE.filter(function(x){return x.season==='2026';}));ckPlayers().forEach(function(p){S.checked[p.id]=MODES[S.mode].finals?!!(mt[p.id]&&(mt[p.id].n>=MIN_QUALI||true)):true;});}
  else if(a==='selnone'){S.checked={};}
  else if(a==='sbreload'){S.sb.state='idle';}
  else if(a==='sbcopy'){var tx=waText(sbNext());try{navigator.clipboard.writeText(tx);t.textContent='Kopiert ✓';}catch(x){prompt('Text:',tx);}return 'stop';}
  else if(a==='sbtake'){var dL=sbNames(t.getAttribute('data-date'));dL.forEach(function(x){var p=ckPlayers().filter(function(q){return q.name===x.name||q.name===x.name+' (Gast)';})[0];
      if(!p)p=S.live?liveGuest(x.name):P(x.guest?x.name+' (Gast)':x.name,45,'',1,.3,null);S.checked[p.id]=true;});}
  else if(a==='testtoggle'){S.testMode=!S.testMode;}
  else if(a==='watchsim'){S.live=false;S.ev=SIM_EV;S.role='spec';S.view='s-live';render();top();return 'stop';}
  else if(a==='fmt'){var ff=t.getAttribute('data-f');S.fmt=ff==='dko'||ff==='sko'?ff:'groups';}
  else if(a==='leglvl'){S.legs.lvl=+t.getAttribute('data-l');S.legs.auto=false;S.legs.custom=null;}
  else if(a==='legauto'){S.legs.auto=!S.legs.auto||t.closest('.warn')!==null;S.legs.custom=null;}
  else if(a==='legadj'){var mdl=MODES[S.mode],idsL=ckPlayers().filter(function(p){return S.checked[p.id];}).length,cur=chooseLegs(mdl,mdl.doubles?Math.floor(idsL/2):idsL).L,kk=t.getAttribute('data-k');
    var cc={};for(var ck in cur)cc[ck]=cur[ck];cur=cc;cur[kk]=Math.max(1,Math.min(4,(cur[kk]||1)+(+t.getAttribute('data-d'))));S.legs.custom=cur;S.legs.auto=false;}
  else if(a==='start'){var nv=newEv(S.mode,TONIGHT,S.boards);var mdS=MODES[S.mode],nS=ckPlayers().filter(function(p){return S.checked[p.id];}).length;nv.legs=chooseLegs(mdS,mdS.doubles?Math.floor(nS/2):nS).L;nv.venueName=VENUES[S.venue]?VENUES[S.venue].name:'Eigener Spielort';S.ev=nv;S.input={};S.msg={};start(nv,ckPlayers().filter(function(p){return S.checked[p.id];}).map(function(p){return p.id;}));
    if(S.live){nv.season=nv.date.slice(0,4);nv.test=nv.date<'2027-01-07'||!!S.testMode;nv.roster={};nv.pids.forEach(function(id){var p=pl(id);nv.roster[id]={name:p.name,team:p.team||'',guest:!!p.guest};});}}
  else if(a==='reset'){S.mode=calMode(TONIGHT);newTonight();}
  else if(a==='archive'&&S.live){ev.archived=true;ARCHIVE.push(ev);S.view='season';S.season=ev.season;}
  else if(a==='archive'){ARCHIVE.push(ev);TONIGHT=nextCalDate(TONIGHT);S.mode=calMode(TONIGHT);newTonight();S.view='season';S.season=CUR_SEASON;}
  else if(a==='view'){S.view=t.getAttribute('data-v');}
  else if(a==='sim'){simMatch(ev,b);}
  else if(a==='simall'){simAll(ev);}
  else if(a==='simv'){simVisit(ev,b);}
  else if(a==='key'){key(b,t.getAttribute('data-k'));}
  else if(a==='quick'){S.input[b]=t.getAttribute('data-q');key(b,'Enter');}
  else if(a==='co'){S.msg[b]=checkoutX(ev,b,+t.getAttribute('data-d'));}
  else if(a==='undo'){S.msg[b]=undo(ev,b);}
  else if(a==='commit'){commit(ev,b);S.msg[b]='';}
  else if(a==='go'){var gm=byId(ev,ev.boards[b]);if(gm)gm.started=true;}
  else if(a==='cd'){var gm2=byId(ev,ev.boards[b]);if(gm2)gm2.started=true;S.msg[b]=cDart(ev,b,+t.getAttribute('data-n'),+t.getAttribute('data-m'));}
  else if(a==='cend'){S.msg[b]=cEnd(ev,b,false);}
  else if(a==='sort'){var k=t.getAttribute('data-k');if(S.sort.k===k)S.sort.d*=-1;else S.sort={k:k,d:k==='name'||k==='best'?1:-1};}
  else if(a==='prof'){if(S.view!=='profile')S.back=S.view;S.pid=+t.getAttribute('data-id');S.view='profile';render();top();return 'stop';}
  else if(a==='back'){S.view=S.back||'season';render();top();return 'stop';}
  else if(a==='watch'){S.role='spec';S.view='s-live';if(LIVEAUTH&&SV.gate){S.live=true;SV.date=SV.gate.date;S.ev=SV.gate.state;ensurePlayers(S.ev);SV.rev=SV.gate.rev;}render();top();return 'stop';}
  else if(a==='showall'){S.showAll=!S.showAll;}
}

LT.addEventListener('change',function(e){if(!e.target.getAttribute)return;if(e.target.getAttribute('data-season')){S.season=e.target.value;render();}else if(e.target.getAttribute('data-me')){S.me=+e.target.value||null;render();}else if(e.target.getAttribute('data-legtarget')){S.legs.target=e.target.value.replace(' Uhr','');render();}else if(e.target.getAttribute('data-legfh')){S.legs.fh=+e.target.value;render();}});
LT.addEventListener('submit',function(e){
  if(e.target.id==='loginform'){e.preventDefault();var code=DOC.getElementById('lg-code').value,role=DOC.getElementById('lg-role').value;
    if(!LIVEAUTH){if(code.trim().toLowerCase()!=='cda'){S.login={err:'Code stimmt nicht.'};render();return;}S.login={};S.role=role;S.view=role;render();top();return;}
    var btn=e.target.querySelector('button[type=submit]');if(btn){btn.disabled=true;btn.textContent='Anmelden …';}
    authLogin(role,code).then(function(){S.login={};S.role=role;S.view=role;return enterLive();}).then(function(){render();top();})
      .catch(function(x){S.login={err:x.message};render();});
    return;}
  if(e.target.id!=='addform')return;e.preventDefault();
  var v=DOC.getElementById('guest').value.trim();if(!v)return;
  var by=+DOC.getElementById('guestby').value||null,p=S.live?liveGuest(v,by):P(v+' (Gast)',45,'',1,.3,by);S.checked[p.id]=true;if(by)S.checked[by]=true;render();
});
if(!SITE)document.addEventListener('keydown',function(e){
  if(!/^b\d+$/.test(S.view))return;
  if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'))return;
  var b=+S.view.slice(1),k=e.key,cr=MD(S.ev).kind==='cricket';
  if((e.ctrlKey||e.metaKey)&&k.toLowerCase()==='z'){e.preventDefault();liveRun(b,function(){S.msg[b]=undo(S.ev,b);});render();return;}
  if(!cr&&(k==='r'||k==='R')){e.preventDefault();liveRun(b,function(){key(b,'Rest');});render();return;}
  if(cr&&/^[tdsTDS]$/.test(k)){e.preventDefault();liveRun(b,function(){key(b,k);});render();return;}
  if(/^\d$/.test(k)||k==='Enter'||k==='Backspace'||k==='Escape'){e.preventDefault();liveRun(b,function(){key(b,k);});render();}
});
if(!SITE){try{var ss=JSON.parse(sessionStorage.getItem('cda-sb')||'null');if(ss&&ss.role&&(ss.role==='spec'||!LIVEAUTH)){S.role=ss.role;S.view=ss.view;S.me=ss.me||null;}}catch(e){}
  if(LIVEAUTH&&AUTH&&AUTH.role){S.role=AUTH.role;S.view=(ss&&ss.role===AUTH.role&&ss.view)||AUTH.role;authRefresh();enterLive();}
  else if(LIVEAUTH&&S.role==='spec'){S.role=null;S.view='gate';}
  if(/#live/.test(location.hash)){S.role=S.role||'spec';if(!/^s-/.test(S.view))S.view='s-live';}
  /* Simulation: im Zuschauermodus läuft der Abend von selbst weiter */
  setInterval(function(){
    if(S.role!=='spec'||!/^s-/.test(S.view)||document.hidden)return;var ev=S.ev;if(ev.phase!=='running')return;
    var act=[];ev.boards.forEach(function(id,b){if(id)act.push(b);});if(!act.length){fill(ev);render();return;}
    var b=act[Math.floor(Math.random()*act.length)],m=byId(ev,ev.boards[b]);
    if(m.over)commit(ev,b);else{simVisit(ev,b);if(m.over)commit(ev,b);}
    if(DOC.activeElement&&DOC.activeElement.tagName==='SELECT')return;render();
  },1800);
}
if(location.protocol==='file:')window.__CDA_TEST=function(){return {S:S,ARCHIVE:ARCHIVE,pl:pl,simVisit:simVisit,simMatch:simMatch,undo:undo,fill:fill,newEv:newEv,render:render,start:start,placements:placements,makePlan:makePlan,PLAYERS:PLAYERS};};
loadRealSeasons();
render();
})();
