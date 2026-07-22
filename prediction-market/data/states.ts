// [abbr, electoral votes, 2024 D-margin, gridCol, gridRow]
export type State = [string, number, number, number, number];
export const STATES: State[] = [
  ["AK",3,-13,0,0],["ME",4,7,11,0],
  ["VT",3,32,10,1],["NH",4,2.8,11,1],
  ["WA",12,18.5,1,2],["MT",4,-20,3,2],["ND",3,-36,4,2],["SD",3,-29.5,5,2],["MN",10,4.2,6,2],["WI",10,-0.9,7,2],["MI",15,-1.4,8,2],["NY",28,12.5,9,2],["MA",11,25,10,2],["RI",4,14,11,2],
  ["OR",8,14,1,3],["ID",4,-36.5,2,2],["NV",6,-3.1,2,3],["WY",3,-46,3,3],["NE",5,-20,4,3],["IA",6,-13,5,3],["IL",19,11,6,3],["IN",11,-19,7,3],["OH",17,-11.2,8,3],["PA",19,-1.7,9,3],["NJ",14,6,10,3],["CT",7,14.5,11,3],
  ["CA",54,20,1,4],["UT",6,-22,2,4],["CO",10,11,3,4],["KS",6,-16,4,4],["MO",10,-18.5,5,4],["KY",8,-30.5,6,4],["WV",4,-42,7,4],["VA",13,5.8,8,4],["MD",10,29,9,4],["DE",3,15,10,4],
  ["AZ",11,-5.5,2,5],["NM",5,6,3,5],["OK",7,-34,4,5],["AR",6,-31,5,5],["TN",11,-29.5,6,5],["NC",16,-3.2,7,5],["SC",9,-18,8,5],["DC",3,81,9,5],
  ["TX",40,-13.7,4,6],["LA",8,-22,5,6],["MS",6,-22.5,6,6],["AL",9,-30.5,7,6],["GA",16,-2.2,8,6],
  ["HI",4,23,0,7],["FL",30,-13,8,7],
];
export const STATE_NAMES: Record<string, string> = { AK:"Alaska",ME:"Maine",VT:"Vermont",NH:"New Hampshire",WA:"Washington",MT:"Montana",ND:"North Dakota",SD:"South Dakota",MN:"Minnesota",WI:"Wisconsin",MI:"Michigan",NY:"New York",MA:"Massachusetts",RI:"Rhode Island",OR:"Oregon",ID:"Idaho",WY:"Wyoming",NE:"Nebraska",IA:"Iowa",IL:"Illinois",IN:"Indiana",OH:"Ohio",PA:"Pennsylvania",NJ:"New Jersey",CT:"Connecticut",CA:"California",UT:"Utah",CO:"Colorado",KS:"Kansas",MO:"Missouri",KY:"Kentucky",WV:"West Virginia",VA:"Virginia",MD:"Maryland",DE:"Delaware",AZ:"Arizona",NM:"New Mexico",OK:"Oklahoma",AR:"Arkansas",TN:"Tennessee",NC:"North Carolina",SC:"South Carolina",DC:"D.C.",TX:"Texas",LA:"Louisiana",MS:"Mississippi",AL:"Alabama",GA:"Georgia",HI:"Hawaii",NV:"Nevada",FL:"Florida" };
