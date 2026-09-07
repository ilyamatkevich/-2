import React,{useEffect,useMemo,useState} from "react";
import {createRoot} from "react-dom/client";
import {Preferences} from "@capacitor/preferences";
import {LocalNotifications} from "@capacitor/local-notifications";
import "./style.css";

const base=[
["🚗 ПДД — 20–30 минут","pdd"],["🇬🇧 Английский — 20–30 минут","english"]
];
const weekly=[
["Неделя 1","🎨 Дизайн для ВК: референсы и требования","🎨 Дизайн для ВК: первый вариант","🎨 Дизайн для ВК: доработка","🎨 Дизайн для ВК: финальные правки","🎨 Дизайн для ВК: экспорт и сдача"],
["Неделя 2","🎨 Портфолио: собрать старые работы","🎬 After Effects: интерфейс и композиция","🎨 Портфолио: выбрать 5 проектов","🎬 After Effects: слои + 💻 вакансии","🎨 Портфолио: выбрать проект №1"],
["Неделя 3","🎨 Проект №1: идея и аудитория","🎬 AE: Position и Scale","🎨 Проект №1: moodboard","🎬 AE: Rotation, Opacity, Keyframes","🎨 Проект №1: цвета и шрифты"],
["Неделя 4","🎨 Проект №1: 3 идеи логотипа","🎬 AE: Easy Ease и Graph Editor","🎨 Проект №1: доработка логотипа","🎬 AE: плавная анимация + 💻 вакансии","🎨 Проект №1: финальный логотип"],
["Неделя 5","🎨 Проект №1: визуальная система","🎬 AE: анимация текста","🎨 Проект №1: визитка и постер","🎬 AE: практика + 💻 вакансии","🎨 Проект №1: собрать материалы кейса"],
["Неделя 6","🎨 Проект №1: первый экран кейса","🎬 AE: Shape Layers","🎨 Проект №1: логотип, цвета, шрифты","🎬 AE: motion практика + 💻 требования","🎉 Проект №1: финальная проверка"],
["Неделя 7","🎨 Проект №2: бренд и референсы","🎬 AE: Mask и Track Matte","🎨 Проект №2: moodboard и стиль","🎬 AE: анимация маской + 💻 вакансии","🎨 Проект №2: первые 3 поста"],
["Неделя 8","🎨 Проект №2: ещё 3 поста","🎬 AE: Pre-compose","🎨 Проект №2: Stories и баннер","🎬 AE: несколько элементов + 💻 резюме","🎨 Проект №2: проверка макетов"],
["Неделя 9","🎨 Проект №2: собрать кейс","🎬 AE: анимация 5–10 секунд","🎨 Проект №2: обложка и описание","🎬 AE: повторение + 💻 резюме","🎉 Проект №2: финальная версия"],
["Неделя 10","📦 Проект №3: продукт и идея","🎬 AE: основы Motion Design","📦 Проект №3: moodboard","🎬 AE: Timing/Spacing + 💻 вакансии","📦 Проект №3: первый вариант упаковки"],
["Неделя 11","📦 Проект №3: доработка","🎬 AE: рекламная анимация","📦 Проект №3: второй вариант","🎬 AE: доработка + 💻 вакансии","📦 Проект №3: постер и баннер"],
["Неделя 12","🎨 Портфолио: собрать проект №3","🎬 Motion Project: идея и референсы","🎨 Портфолио: выбрать лучшие работы","💻 Финальное резюме и 5 вакансий","🏆 Итоги 90 дней и новый план"]
];
function tasksFor(day){
 const w=Math.floor(day/5), d=day%5, item=weekly[w]||weekly[11];
 return [...base.map(x=>({text:x[0],cat:x[1]})),{text:item[d+1],cat:item[d+1].includes("After")||item[d+1].includes("AE")||item[d+1].includes("Motion")?"ae":item[d+1].includes("ваканс")||item[d+1].includes("резюме")?"work":"design"}];
}
function App(){
 const [day,setDay]=useState(0),[done,setDone]=useState({}),[tab,setTab]=useState("today"),[times,setTimes]=useState({main:"20:00",english:"21:30",pdd:"22:00"});
 useEffect(()=>{(async()=>{let r=await Preferences.get({key:"plan90"});if(r.value){let x=JSON.parse(r.value);setDone(x.done||{});setTimes(x.times||times)}})()},[]);
 useEffect(()=>{Preferences.set({key:"plan90",value:JSON.stringify({done,times})})},[done,times]);
 const tasks=tasksFor(day), key=`${day}`;
 const toggle=i=>setDone(x=>({...x,[key]:{...(x[key]||{}),[i]:!x[key]?.[i]}}));
 const completed=tasks.filter((_,i)=>done[key]?.[i]).length;
 const allDays=Array.from({length:60},(_,d)=>tasksFor(d));
 const total=allDays.reduce((a,t)=>a+t.length,0);
 const totalDone=Object.values(done).reduce((a,x)=>a+Object.values(x).filter(Boolean).length,0);
 const percent=Math.round(totalDone/total*100);
 async function notifications(){
   const p=await LocalNotifications.requestPermissions(); if(p.display!=="granted") return alert("Разреши уведомления в настройках телефона.");
   const [h1,m1]=times.main.split(":").map(Number),[h2,m2]=times.english.split(":").map(Number),[h3,m3]=times.pdd.split(":").map(Number);
   const now=new Date(), list=[
    {id:1,title:"🎯 Мой план",body:"Время главной задачи!",h:h1,m:m1},
    {id:2,title:"🇬🇧 Английский",body:"Время заниматься английским!",h:h2,m:m2},
    {id:3,title:"🚗 ПДД",body:"Не забудь про билеты!",h:h3,m:m3}
   ].map(x=>{let at=new Date(now);at.setHours(x.h,x.m,0,0);if(at<=now)at.setDate(at.getDate()+1);return {...x,schedule:{at,repeats:true,every:"day"}}});
   await LocalNotifications.schedule({notifications:list}); alert("Напоминания включены!");
 }
 if(tab==="stats")return <main><h1>📊 Статистика</h1><div className="card big">{percent}%<small>общий прогресс</small></div><div className="card">Выполнено задач: <b>{totalDone}</b> из {total}</div><button onClick={()=>setTab("today")}>← Сегодня</button></main>;
 if(tab==="settings")return <main><h1>⚙️ Настройки</h1><div className="card">{["main","english","pdd"].map(k=><label key={k}>{k==="main"?"Главная задача":k==="english"?"Английский":"ПДД"}<input type="time" value={times[k]} onChange={e=>setTimes({...times,[k]:e.target.value})}/></label>)}</div><button onClick={notifications}>🔔 Включить уведомления</button><button onClick={()=>setTab("today")}>← Назад</button></main>;
 return <main><h1>🌱 Мой план 90 дней</h1><div className="week">{weekly[Math.floor(day/5)][0]} · День {day%5+1}</div><div className="progress"><div style={{width:`${completed/tasks.length*100}%`}}/></div><p>{completed} из {tasks.length} выполнено</p><div className="days">{[0,1,2,3,4].map(i=><button className={day%5===i?"active":""} onClick={()=>setDay(Math.floor(day/5)*5+i)}>Д{i+1}</button>)}</div>{tasks.map((t,i)=><div className={"task "+(done[key]?.[i]?"checked":"")} onClick={()=>toggle(i)} key={i}><input type="checkbox" checked={!!done[key]?.[i]} readOnly/><span>{t.text}</span></div>)}<div className="bottom"><button onClick={()=>setDay(Math.max(0,day-5))}>← Неделя</button><button onClick={()=>setDay(Math.min(59,day+5))}>Неделя →</button></div><nav><button onClick={()=>setTab("today")}>🏠 Сегодня</button><button onClick={()=>setTab("stats")}>📊 Статистика</button><button onClick={()=>setTab("settings")}>⚙️</button></nav></main>
}
createRoot(document.getElementById("root")).render(<App/>);