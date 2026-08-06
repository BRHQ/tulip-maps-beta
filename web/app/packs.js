/* Tulip Maps symbol packs — scenery symbols for the tulip editor.
   "Stuff you might see as you drive about" (Chris, 6 Aug): the Sahara test —
   if the book is your only way through, the odd rock, tree or building it
   promises should look like the real thing.

   Every symbol is drawn TWICE and the whole book swaps in one go
   (BOOKSTYLE.sym in tulip_core.js):
     solid — filled silhouette, details cut out in white  (style C on the board)
     line  — a light line drawing                          (style B on the board)
   Drawn in a 48×48 box about centre (24,24). Ops: {d:"SVG path", w:width}
   — with w the path is STROKED, without it it's FILLED. "cuts" paint white
   and only show in solid style. Colour versions: parked, Chris may come back.

   Adding a symbol = one entry here. It lands in the editor's symbol window
   AND the quick tab's corner slots automatically (both read PACK_CAT). */
"use strict";

const PACKS=[
{key:"terr", g:"Desert & terrain", items:[
  {id:"dune", label:"Dune", kw:"sand dunes desert sahara",
   fill:[{d:"M3 34 Q24 12 45 34 Z"}],
   cuts:[{d:"M13 28 Q24 19 36 27",w:1.8}],
   line:[{d:"M3 34 Q24 12 45 34",w:2},{d:"M13 28 Q24 19 36 27",w:1.6}]},
  {id:"rocks", label:"Rocks", kw:"stones boulders outcrop",
   fill:[{d:"M5 34 L14 18 L24 34 Z"},{d:"M22 34 L29 24 L36 34 Z"},{d:"M34 34 L39 28 L44 34 Z"}],
   cuts:[{d:"M14 18 L16 34",w:1.4}],
   line:[{d:"M5 34 L14 18 L24 34 Z",w:2},{d:"M22 34 L29 24 L36 34 Z",w:2},{d:"M34 34 L39 28 L44 34 Z",w:2}]},
  {id:"boulder", label:"Boulder", kw:"big rock stone",
   fill:[{d:"M11 36 Q5 30 10 23 Q13 14 25 14 Q38 14 40 24 Q44 31 37 36 Z"}],
   cuts:[{d:"M21 19 L25 27 L22 36",w:1.4}],
   line:[{d:"M11 36 Q5 30 10 23 Q13 14 25 14 Q38 14 40 24 Q44 31 37 36 Z",w:2},{d:"M21 19 L25 27 L22 36",w:1.5}]},
  {id:"cliff", label:"Cliff edge", kw:"drop crag rock face steep",
   fill:[{d:"M8 8 L28 8 L24 15 L31 21 L25 29 L30 40 L8 40 Z"}],
   cuts:[],
   line:[{d:"M28 8 L24 15 L31 21 L25 29 L30 40",w:2},{d:"M8 8 L28 8 M8 40 L30 40",w:2},
         {d:"M34 40 H39 M36.5 33 H41",w:1.6}]},
  {id:"cactus", label:"Cactus", kw:"desert saguaro",
   fill:[{d:"M21 40 V15 Q21 9 25.5 9 Q30 9 30 15 V40 Z"},
         {d:"M21 27 H16 Q12 27 12 22 V17 H16 V21 Q16 23 18 23 H21 Z"},
         {d:"M30 31 H34 Q38 31 38 26 V20 H34 V25 Q34 27 32 27 H30 Z"}],
   cuts:[],
   line:[{d:"M21 40 V15 Q21 9 25.5 9 Q30 9 30 15 V40",w:2},
         {d:"M21 25 H18 Q14 25 14 20 V17",w:2},{d:"M30 29 H32 Q36 29 36 24 V20",w:2}]},
  {id:"palm", label:"Palm", kw:"tree oasis desert",
   fill:[{d:"M26 41 C25 33 25 24 28 14",w:3.2},
         {d:"M28 13 Q21 6 13.5 9.5",w:2.6},{d:"M28 13 Q23 4 16 4.5",w:2.6},
         {d:"M28 13 Q32 4 39 5.5",w:2.6},{d:"M28 13 Q35 7 41.5 11",w:2.6},
         {d:"M28 13 Q37 13 40 18.5",w:2.6},{d:"M28 13 Q19 13 16 18.5",w:2.6},
         {d:"M26.6 15.4 m-1.7 0 a1.7 1.7 0 1 0 3.4 0 a1.7 1.7 0 1 0 -3.4 0"},
         {d:"M29.8 15.8 m-1.7 0 a1.7 1.7 0 1 0 3.4 0 a1.7 1.7 0 1 0 -3.4 0"}],
   cuts:[],
   line:[{d:"M26 41 C25 33 25 24 28 14",w:2},
         {d:"M28 13 Q21 6 13.5 9.5",w:2},{d:"M28 13 Q23 4 16 4.5",w:2},
         {d:"M28 13 Q32 4 39 5.5",w:2},{d:"M28 13 Q35 7 41.5 11",w:2},
         {d:"M28 13 Q37 13 40 18.5",w:2},{d:"M28 13 Q19 13 16 18.5",w:2}]},
  {id:"well", label:"Oasis / well", kw:"water spring desert stop",
   fill:[{d:"M10 22 L24 12 L38 22 L34.5 22 L24 14.8 L13.5 22 Z"},
         {d:"M12 22 H15 V36 H12 Z"},{d:"M33 22 H36 V36 H33 Z"},
         {d:"M13 36 A11 5.5 0 0 1 35 36 L31.8 36 A7.8 3.6 0 0 0 16.2 36 Z"},
         {d:"M24 16.5 V24.5",w:1.6},{d:"M21 24 H27 V29 H21 Z"}],
   cuts:[],
   line:[{d:"M10 22 L24 12 L38 22",w:2},{d:"M13.5 22 V36 M34.5 22 V36",w:2},
         {d:"M13 36 A11 5.5 0 0 1 35 36",w:2},{d:"M24 16 V24",w:1.6},{d:"M21 24 H27 V29 H21 Z",w:1.6}]},
  {id:"ruin", label:"Ruin", kw:"broken wall old building remains",
   fill:[{d:"M8 40 V22 H14 V16 H20 V22 H26 V12 H34 V22 H40 V40 Z"}],
   cuts:[{d:"M14 28 H34 M14 34 H34",w:1.3},{d:"M24 22 V40 M17 22 V28 M31 22 V28",w:1.3}],
   line:[{d:"M8 40 V22 H14 V16 H20 V22 H26 V12 H34 V22 H40 V40",w:2},{d:"M8 40 H40",w:2},
         {d:"M15 30 H24 M28 27 H33",w:1.4}]},
  {id:"mast", label:"Mast", kw:"antenna aerial tower radio phone signal",
   fill:[{d:"M17 40 L24 8 L31 40",w:2.4},{d:"M19.7 28 H28.3 M21.5 19.5 H26.6 M17 40 H31",w:2},
         {d:"M19.7 28 L28.3 19.5 M28.3 28 L21.5 19.5",w:1.6},
         {d:"M24 8 m-2.2 0 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0"}],
   cuts:[],
   line:[{d:"M17 40 L24 8 L31 40",w:2},{d:"M19.7 28 H28.3 M21.5 19.5 H26.6 M17 40 H31",w:1.6},
         {d:"M19.7 28 L28.3 19.5 M28.3 28 L21.5 19.5",w:1.3},
         {d:"M24 8 m-2.2 0 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0",w:1.6}]},
  {id:"hut", label:"Hut", kw:"cabin shed shelter bothy refuge",
   fill:[{d:"M10 40 V22 H38 V40 Z"},{d:"M7 22 L24 10 L41 22 Z"}],
   cuts:[{d:"M21 40 V28 H27 V40 Z"}],
   line:[{d:"M10 40 V22 M38 22 V40 M10 40 H38",w:2},{d:"M7 22 L24 10 L41 22",w:2},
         {d:"M21 40 V28 H27 V40",w:1.6}]},
]},
{key:"anim", g:"Animals", items:[
  {id:"sheep", label:"Sheep", kw:"lamb flock livestock",
   fill:[{d:"M15 24 H18 V36 H15 Z"},{d:"M21 25 H24 V37 H21 Z"},{d:"M27 25 H30 V37 H27 Z"},{d:"M32 24 H35 V36 H32 Z"},
         {d:"M17 18 m-6.5 0 a6.5 6.5 0 1 0 13 0 a6.5 6.5 0 1 0 -13 0"},
         {d:"M24 15.5 m-7.5 0 a7.5 7.5 0 1 0 15 0 a7.5 7.5 0 1 0 -15 0"},
         {d:"M31 18 m-6.5 0 a6.5 6.5 0 1 0 13 0 a6.5 6.5 0 1 0 -13 0"},
         {d:"M12 21 Q12 16 17 16 H33 Q38 16 38 21 V22 Q38 27 33 27 H17 Q12 27 12 22 Z"},
         {d:"M35.2 17.2 Q40 16.6 41.4 20.4 Q42.4 24.4 38.6 25.8 Q35.6 26.6 34 24 Z"}],
   cuts:[{d:"M38.6 20 m-1.1 0 a1.1 1.1 0 1 0 2.2 0 a1.1 1.1 0 1 0 -2.2 0"}],
   line:[{d:"M17 36 V28 M23 37 V28 M29 37 V28 M34 36 V28",w:2},
         {d:"M12.5 24 A5.5 5.5 0 0 1 12 16 A6.5 6.5 0 0 1 20 10 A7 7 0 0 1 29.5 10 A6.5 6.5 0 0 1 37.5 16 A5.5 5.5 0 0 1 37 24 Z",w:2},
         {d:"M36.5 24 C39 25 41 23.5 41 21 C41 19 39.5 17.5 37.5 17.5",w:2}]},
  {id:"camel", label:"Camel", kw:"desert hump dromedary",
   fill:[{d:"M17.5 29 H19.9 V40 H17.5 Z"},{d:"M22.5 30 H24.9 V40 H22.5 Z"},
         {d:"M30 30 H32.4 V40 H30 Z"},{d:"M35 29 H37.4 V40 H35 Z"},
         {d:"M24 20.5 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0"},
         {d:"M32 20.5 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0"},
         {d:"M16 25 Q16 21.5 20 21.5 H35 Q39 21.5 39 25.5 Q39 30 35 30 H20 Q16 30 16 25 Z"},
         {d:"M16.5 27 C13.5 25.5 12.3 20 12.6 13.5 L15.8 13.5 C15.8 19 16.8 22 19 24.5 Z"},
         {d:"M13.2 12.2 m-3.1 0 a3.1 2.4 0 1 0 6.2 0 a3.1 2.4 0 1 0 -6.2 0"},
         {d:"M10.5 12.5 L8.3 14 L10.7 14.6 Z"},
         {d:"M38.8 24 Q41.4 25.4 41.2 28.6",w:1.6}],
   cuts:[],
   line:[{d:"M18.7 40 V30 M23.7 40 V30 M31.2 40 V30 M36.2 40 V30",w:2},
         {d:"M16.5 27 C14 25 13 20 13.3 14",w:2},
         {d:"M13.3 14 Q13 10.5 10 11.5 M13.3 14 Q14.6 10.6 16.4 12.4",w:1.8},
         {d:"M16.5 27 Q16 22 20 21 Q20.5 16.5 24 16.5 Q27.5 16.5 28 20.5 Q28.5 16.5 32 16.5 Q35.5 16.5 36 21 Q39 22 39 26 Q39 30 35 30 H20 Q17 30 16.5 27 Z",w:2},
         {d:"M39 24.5 Q41.4 25.6 41.2 28.6",w:1.6}]},
]},
{key:"veh", g:"Vehicles", items:[
  {id:"car4x4", label:"4×4", kw:"car jeep landy landrover suv vehicle",
   fill:[{d:"M8 19 H40 Q41.5 19 41.5 21 V27 Q41.5 29.5 39 29.5 H9 Q6.5 29.5 6.5 27 V21 Q6.5 19 8 19 Z"},
         {d:"M14 20 L17 12.5 Q17.5 11.5 18.7 11.5 H28.5 Q29.7 11.5 30.2 12.5 L33.5 20 Z"},
         {d:"M15.5 31 m-4.6 0 a4.6 4.6 0 1 0 9.2 0 a4.6 4.6 0 1 0 -9.2 0"},
         {d:"M33 31 m-4.6 0 a4.6 4.6 0 1 0 9.2 0 a4.6 4.6 0 1 0 -9.2 0"}],
   cuts:[{d:"M18.7 13.4 L16.6 18.3 H23 V13.4 Z"},{d:"M25 13.4 V18.3 H31 L28.9 13.4 Z"},
         {d:"M15.5 31 m-1.7 0 a1.7 1.7 0 1 0 3.4 0 a1.7 1.7 0 1 0 -3.4 0"},
         {d:"M33 31 m-1.7 0 a1.7 1.7 0 1 0 3.4 0 a1.7 1.7 0 1 0 -3.4 0"}],
   line:[{d:"M10.5 29 H8.8 Q8 29 8 28 V21.5 Q8 19.5 10 19.5 H14.5 L17.5 12.9 Q18 12 19 12 H28.4 Q29.4 12 29.9 12.9 L33 19.5 H38 Q40 19.5 40 21.5 V28 Q40 29 39.2 29 H37.6",w:2},
         {d:"M20.2 29 H28.4",w:2},
         {d:"M15.5 30.5 m-4.2 0 a4.2 4.2 0 1 0 8.4 0 a4.2 4.2 0 1 0 -8.4 0",w:2},
         {d:"M33 30.5 m-4.2 0 a4.2 4.2 0 1 0 8.4 0 a4.2 4.2 0 1 0 -8.4 0",w:2},
         {d:"M23.8 12.6 V19.5 M15.2 19.5 H32.6",w:2}]},
  {id:"tractor", label:"Tractor", kw:"farm vehicle slow",
   fill:[{d:"M31.5 29 m-8.6 0 a8.6 8.6 0 1 0 17.2 0 a8.6 8.6 0 1 0 -17.2 0"},
         {d:"M12.5 33 m-5.2 0 a5.2 5.2 0 1 0 10.4 0 a5.2 5.2 0 1 0 -10.4 0"},
         {d:"M7.5 27.5 V21.5 Q7.5 19.6 9.4 19.6 H21.5 V27.5 Z"},
         {d:"M21.5 27 V10.5 Q21.5 9 23 9 H31 Q32.5 9 32.5 10.5 V20.5 Z"},
         {d:"M10.5 12.5 H13.1 V20.5 H10.5 Z"}],
   cuts:[{d:"M23.6 11.2 H30.2 V18.2 H23.6 Z"},
         {d:"M31.5 29 m-3.1 0 a3.1 3.1 0 1 0 6.2 0 a3.1 3.1 0 1 0 -6.2 0"},
         {d:"M12.5 33 m-1.9 0 a1.9 1.9 0 1 0 3.8 0 a1.9 1.9 0 1 0 -3.8 0"}],
   line:[{d:"M31.5 29 m-7.9 0 a7.9 7.9 0 1 0 15.8 0 a7.9 7.9 0 1 0 -15.8 0",w:2},
         {d:"M31.5 29 m-2.7 0 a2.7 2.7 0 1 0 5.4 0 a2.7 2.7 0 1 0 -5.4 0",w:1.6},
         {d:"M12.5 33 m-4.6 0 a4.6 4.6 0 1 0 9.2 0 a4.6 4.6 0 1 0 -9.2 0",w:2},
         {d:"M12.5 33 m-1.5 0 a1.5 1.5 0 1 0 3 0 a1.5 1.5 0 1 0 -3 0",w:1.4},
         {d:"M17.5 32 H23.7 M8 28.5 V21.5 Q8 20.1 9.4 20.1 H22 M22 27 V10.9 Q22 10 23 10 H31 Q32 10 32 10.9 V19",w:2},
         {d:"M11.8 20 V12.8 M24 12 H30 V18.5 H24 Z",w:1.8}]},
]},
{key:"bld", g:"Buildings", items:[
  {id:"house", label:"House", kw:"home cottage village",
   fill:[{d:"M10 40 V20 H38 V40 Z"},{d:"M7 21 L24 9 L41 21 Z"},{d:"M31 11 H35 V17 H31 Z"}],
   cuts:[{d:"M20.5 40 V29 H27.5 V40 Z"},{d:"M13.5 24 H18 V29 H13.5 Z"},{d:"M30 24 H34.5 V29 H30 Z"}],
   line:[{d:"M10 40 V21 M38 21 V40 M10 40 H38",w:2},{d:"M7 21 L24 9.5 L41 21",w:2},
         {d:"M31.5 12 V11 H35 V17",w:1.8},{d:"M20.5 40 V29 H27.5 V40",w:1.6},{d:"M13.5 24 H18 V29 H13.5 Z",w:1.4}]},
  {id:"hospital", label:"Hospital", kw:"medical cross doctor emergency",
   fill:[{d:"M9 17 H39 V36 H9 Z"},{d:"M6.5 17.5 L24 7 L41.5 17.5 Z"}],
   cuts:[{d:"M21.7 20.5 H26.3 V32.1 H21.7 Z"},{d:"M18.2 24 H29.8 V28.6 H18.2 Z"}],
   line:[{d:"M10 18 V36 H38 V18",w:2},{d:"M6.5 17.8 L24 7.5 L41.5 17.8",w:2},
         {d:"M24 21.5 V32 M18.7 26.7 H29.3",w:2}]},
]},
{key:"tree", g:"Trees", items:[
  {id:"oak", label:"Oak", kw:"broadleaf big tree lone",
   fill:[{d:"M21.5 28 H26.5 V41 H21.5 Z"},
         {d:"M15 21 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0"},
         {d:"M24 14.5 m-9.5 0 a9.5 9.5 0 1 0 19 0 a9.5 9.5 0 1 0 -19 0"},
         {d:"M33 21 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0"},
         {d:"M19 26 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0"},
         {d:"M29 26 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0"}],
   cuts:[],
   line:[{d:"M22 41 V30 M26 41 V30",w:2},
         {d:"M17 31 A7.5 7.5 0 0 1 9 22 A8.5 8.5 0 0 1 15.5 9.5 A9 9 0 0 1 32.5 9.5 A8.5 8.5 0 0 1 39 22 A7.5 7.5 0 0 1 31 31 Z",w:2}]},
  {id:"pine", label:"Pine", kw:"conifer fir forest tree",
   fill:[{d:"M24 4.5 L33 16 H15 Z"},{d:"M24 10.5 L35 24 H13 Z"},{d:"M24 16.5 L37 32.5 H11 Z"},
         {d:"M21.8 32.5 H26.2 V41 H21.8 Z"}],
   cuts:[],
   line:[{d:"M15.5 15.5 L24 5 L32.5 15.5 H28.5 L35 23.5 H30.5 L37 32 H26.5 M21.5 32 H11 L17.5 23.5 H13 L19.5 15.5 Z",w:2},
         {d:"M22 32.5 V41 M26 32.5 V41",w:2}]},
]},
{key:"fen", g:"Fences & gates", items:[
  {id:"gate5", label:"5-bar gate", kw:"farm gate field closed",
   fill:[{d:"M8.5 11 H12.1 V38 H8.5 Z"},{d:"M35.9 11 H39.5 V38 H35.9 Z"},
         {d:"M12 14.5 H36 V17.2 H12 Z"},{d:"M12 20.5 H36 V23.2 H12 Z"},
         {d:"M12 26.5 H36 V29.2 H12 Z"},{d:"M12 32.5 H36 V35.2 H12 Z"},
         {d:"M12 35.4 L34.5 14.2 L36 16.6 L13.7 37.4 Z"}],
   cuts:[],
   line:[{d:"M10.3 38 V11.5 M37.7 38 V11.5",w:2},
         {d:"M12 16 H36 M12 22 H36 M12 28 H36 M12 34 H36",w:1.8},
         {d:"M12.5 34 L35.5 16",w:1.8}]},
  {id:"cattlegrid", label:"Cattle grid", kw:"grid bars farm boundary",
   fill:[{d:"M7 17 H41 V31 H7 Z"}],
   cuts:[{d:"M11 19 H13.4 V29 H11 Z"},{d:"M16.4 19 H18.8 V29 H16.4 Z"},{d:"M21.8 19 H24.2 V29 H21.8 Z"},
         {d:"M27.2 19 H29.6 V29 H27.2 Z"},{d:"M32.6 19 H35 V29 H32.6 Z"}],
   line:[{d:"M7 17 H41 V31 H7 Z",w:2},
         {d:"M12.7 17 V31 M18.4 17 V31 M24 17 V31 M29.6 17 V31 M35.3 17 V31",w:1.6}]},
]},
{key:"farm", g:"Farm", items:[
  {id:"barn", label:"Barn", kw:"farm building shed",
   fill:[{d:"M6 17 H42 V36 H6 Z"},{d:"M3.5 17.5 L15 7.5 H33 L44.5 17.5 Z"}],
   cuts:[{d:"M19.5 21 H28.5 V36 H19.5 Z"},{d:"M20.3 21.6 L27.7 35.4 M27.7 21.6 L20.3 35.4",w:1.4}],
   line:[{d:"M7 18 V36 H41 V18",w:2},{d:"M3.5 17.5 L15 8 H33 L44.5 17.5",w:2},
         {d:"M19.5 36 V21 H28.5 V36",w:1.8},{d:"M19.5 21.6 L28.5 35.4 M28.5 21.6 L19.5 35.4",w:1.4}]},
  {id:"haybale", label:"Hay bale", kw:"straw round bale field",
   fill:[{d:"M24 25 m-11 0 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0"}],
   cuts:[{d:"M24 25 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0",w:1.5},
         {d:"M24 25 m-3.4 0 a3.4 3.4 0 1 0 6.8 0 a3.4 3.4 0 1 0 -6.8 0",w:1.5}],
   line:[{d:"M24 25 m-11 0 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0",w:2},
         {d:"M24 25 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0",w:1.6},
         {d:"M24 25 m-3.2 0 a3.2 3.2 0 1 0 6.4 0 a3.2 3.2 0 1 0 -6.4 0",w:1.4}]},
]},
];

/* Trees offers the palm too — same drawing, no copy */
(function(){ const terr=PACKS[0].items, palm=terr.find(s=>s.id==="palm");
  PACKS.find(p=>p.key==="tree").items.push(palm); })();

const PACK_INDEX={}, PACK_KW={};
for(const p of PACKS) for(const s of p.items){ PACK_INDEX["pk_"+s.id]=s; PACK_KW["pk_"+s.id]=(s.label+" "+(s.kw||"")).toLowerCase(); }

function drawPackSymbol(ctx,name,x,y,sc){
  const sym=PACK_INDEX[name]; if(!sym) return;
  const style=(typeof BOOKSTYLE!=="undefined"&&BOOKSTYLE.sym)||"solid";
  const s=(sc||1)*(44/48);
  ctx.save(); ctx.translate(x,y); ctx.scale(s,s); ctx.translate(-24,-24);
  ctx.lineCap="round"; ctx.lineJoin="round";
  ctx.fillStyle=INKC; ctx.strokeStyle=INKC;
  const ops=(style==="line"&&sym.line&&sym.line.length)?sym.line:sym.fill;
  for(const o of ops){ const p=new Path2D(o.d);
    if(o.w){ ctx.lineWidth=o.w; ctx.stroke(p); } else ctx.fill(p); }
  if(style!=="line"&&sym.cuts) for(const o of sym.cuts){ const p=new Path2D(o.d);
    if(o.w){ ctx.strokeStyle="#fff"; ctx.lineWidth=o.w; ctx.stroke(p); ctx.strokeStyle=INKC; }
    else { ctx.fillStyle="#fff"; ctx.fill(p); ctx.fillStyle=INKC; } }
  ctx.restore();
}
function PACK_CAT(){ return PACKS.map(p=>({g:p.g, items:p.items.map(s=>["pk_"+s.id, s.label])})); }
