export type DemoProduct = {id:string; name:string; price:number; stock:number; category:string; shop:string; image?:string};
export type DemoOrder = {id:string; customer:string; total:number; status:string; shop:string};
export type DemoShop = {id:string; name:string; slug:string; published:boolean};
export type DemoCoupon = {id:string; code:string; percent:number};
export type DemoData = {products:DemoProduct[]; orders:DemoOrder[]; shops:DemoShop[]; coupons:DemoCoupon[]};
const STORAGE_KEY = 'otemu_ux_demo_v1';
export const demoSeed: DemoData = {
  shops:[{id:'s1',name:'Cofee Studio',slug:'cofee',published:true},{id:'s2',name:'Atelier Nube',slug:'atelier',published:false}],
  products:[
    {id:'p1',name:'Café de especialidad',price:39,stock:26,category:'Bebidas',shop:'s1'},
    {id:'p2',name:'Taza de cerámica',price:49,stock:12,category:'Hogar',shop:'s1'},
    {id:'p3',name:'Café molido 250 g',price:35,stock:8,category:'Bebidas',shop:'s1'},
    {id:'p4',name:'Tote bag natural',price:59,stock:21,category:'Accesorios',shop:'s2'},
  ],
  orders:[{id:'OT-1042',customer:'Ana Gómez',total:88,status:'Pendiente',shop:'s1'}, {id:'OT-1041',customer:'Luis Torres',total:39,status:'En preparación',shop:'s1'}, {id:'OT-1040',customer:'Elena Ruiz',total:98,status:'Entregado',shop:'s2'}],
  coupons:[{id:'c1',code:'BIENVENIDA10',percent:10}]
};
export function readDemo():DemoData {
  if(typeof window === 'undefined') return demoSeed;
  try { const raw=window.localStorage.getItem(STORAGE_KEY); if(raw){const obj=JSON.parse(raw);if(Array.isArray(obj.products)&&Array.isArray(obj.orders)&&Array.isArray(obj.shops)&&Array.isArray(obj.coupons))return obj;} }catch{}
  return JSON.parse(JSON.stringify(demoSeed));
}
export function saveDemo(d:DemoData){if(typeof window !== 'undefined')try{window.localStorage.setItem(STORAGE_KEY,JSON.stringify(d))}catch{} }
export function resetDemo(){if(typeof window!=='undefined')window.localStorage.removeItem(STORAGE_KEY)}
export function money(n:number){return new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n)}
export function demoId(prefix='x'){return prefix+Math.random().toString(36).slice(2,8)}
