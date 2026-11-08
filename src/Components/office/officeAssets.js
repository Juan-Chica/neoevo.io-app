// Profile is fixed per office visit to avoid loading both sets during rotation/resizing.
let profile;
export function officeProfile(){
 if(!profile){const query=new URLSearchParams(window.location.search);profile=query.get('quality')==='high'?'desktop':query.get('quality')==='low'||window.innerWidth<700||window.matchMedia('(pointer: coarse)').matches?'mobile':'desktop';}
 return profile;
}
export function clearOfficeProfile(){profile=undefined;}
export const MODEL_VARIANTS={
 'office-desk.glb':'balanced','office-chair.glb':'balanced','office-sofa.glb':'balanced',
 'neoevo-coffee-table.glb':'balanced','neoevo-large-plant.glb':'balanced','neoevo-shelf.glb':'safe',
};
const versions={
  "models/stage9-furniture/desktop/office-desk.glb": "2fecea87cf5d",
  "models/stage9-furniture/desktop/neoevo-shelf.glb": "39dea2c77362",
  "models/stage9-furniture/mobile/office-desk.glb": "fcab4f983362",
  "models/stage9-furniture/mobile/neoevo-shelf.glb": "d9480bc47712",
  "models/stage5/balanced/neoevo-coffee-table.glb": "082190c36b46",
  "models/stage5/balanced/neoevo-large-plant.glb": "553b3e71f0d2",
  "models/stage5/balanced/office-chair.glb": "5929c276aa67",
  "models/stage5/balanced/office-sofa.glb": "0d1bac9eeb05",
  "models/stage5/mobile/neoevo-coffee-table.glb": "efcf0d24013f",
  "models/stage5/mobile/neoevo-large-plant.glb": "30a12bdc7192",
  "models/stage5/mobile/office-chair.glb": "f5669930c383",
  "models/stage5/mobile/office-sofa.glb": "9802c67a1a3d",
  "models/stage5/architecture-merged.glb": "0fe1a15bfcb0",
  "models/stage5/lighting-brand-merged.glb": "f5c35393b148",
  "models/stage5/glass-merged.glb": "4e703d8b02a4"
};
const original=()=>import.meta.env.MODE==='office-review'&&new URLSearchParams(window.location.search).get('assets')==='original';
const versioned=path=>'/'+path+'?v='+versions[path];
const furnitureModels = new Set(['office-desk.glb', 'neoevo-shelf.glb']);
export function officeModel(name) {
 if (original()) return '/models/' + name;
 const profile = officeProfile();
 if (furnitureModels.has(name)) return versioned('models/stage9-furniture/' + profile + '/' + name);
 const variant = profile === 'mobile' ? 'mobile' : MODEL_VARIANTS[name];
 return versioned('models/stage5/' + variant + '/' + name);
}
export function officeArchitecture(name){return original()?'/models/stage3/'+name+'.glb':versioned('models/stage5/'+name+'-merged.glb');}
export function officeAssetUrls(){return [...Object.keys(MODEL_VARIANTS).map(officeModel),...['architecture','lighting-brand','glass'].map(officeArchitecture)];}
export const DRACO_PATH='/decoders/draco/';
