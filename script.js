const menuButton=document.querySelector('.menu-btn');const nav=document.querySelector('.navigation');
menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));menuButton.textContent=open?'×':'☰';});
document.querySelectorAll('.navigation a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuButton?.setAttribute('aria-expanded','false');if(menuButton)menuButton.textContent='☰';}));
const filters=document.querySelectorAll('.filter');const projects=document.querySelectorAll('.project');
filters.forEach(button=>button.addEventListener('click',()=>{filters.forEach(b=>b.classList.toggle('active',b===button));const f=button.dataset.filter;projects.forEach(p=>p.hidden=f!=='all'&&p.dataset.category!==f);}));
const archiveData={
 chuangxin:['Ảnh sản phẩm chính','Ảnh mô tả','Banner gian hàng','Bộ chiến dịch','Sổ / lịch','Social visual'],
 vulin:['Màn hình app','User flow','UI component','Banner app','Social post','Visual concept'],
 tinfunding:['Branding','Website','App screen','Campaign banner','Marketing post','Video frame'],
 travelplus:['Poster tour','Banner quảng cáo','Social post','Key visual','Video frame','Tour promotion'],
 freelance:['Logo design','Brand application','Banner','Poster','Social asset','Video frame']
};
document.querySelectorAll('.archive-row').forEach(button=>button.addEventListener('click',()=>{
 const key=button.dataset.archive;const panel=document.getElementById('archive-'+key);if(!panel)return;
 const open=panel.classList.toggle('open');button.classList.toggle('open',open);
 if(open&&!panel.dataset.built){const gallery=panel.querySelector('.mini-gallery');const labels=archiveData[gallery.dataset.gallery]||[];gallery.innerHTML=`<div class="gallery-toolbar"><div><strong>Chưa có ảnh trong thư viện</strong><span>Thêm bao nhiêu tác phẩm cũng được · đặt tên và phân loại từng ảnh</span></div><button type="button" class="gallery-add gallery-add-empty">＋ Thêm hình ảnh</button></div><div class="gallery-placeholder-grid">${labels.map((label,i)=>`<div class="mini-tile"><strong>GỢI Ý ${String(i+1).padStart(2,'0')}</strong><span>${label}</span></div>`).join('')}</div>`;gallery.querySelector('.gallery-add-empty').addEventListener('click',()=>document.querySelector(`[data-gallery-upload="${gallery.dataset.gallery}"]`)?.click());panel.dataset.built='true';}
}));
const copyButton=document.querySelector('#copyEmail');const toast=document.querySelector('.toast');
copyButton?.addEventListener('click',async()=>{const email=copyButton.dataset.email;try{await navigator.clipboard.writeText(email);toast.textContent='Đã sao chép email';}catch{toast.textContent='Hãy cập nhật email thật trong index.html: '+email;}toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2400);});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});
document.querySelectorAll('.project,.cap-grid article,.timeline article,.process-grid article').forEach(el=>{el.style.opacity='0';el.style.transform='translateY(14px)';el.style.transition='opacity .55s ease,transform .55s ease';observer.observe(el);});
const reveal=document.createElement('style');reveal.textContent='.visible{opacity:1!important;transform:translateY(0)!important}';document.head.appendChild(reveal);

/* Self-service image manager: stores uploaded images in this browser's IndexedDB. */
(()=>{
 const launch=document.getElementById('openPortfolioEditor');
 const panel=document.getElementById('portfolioEditor');
 const scrim=document.getElementById('portfolioEditorScrim');
 const close=document.getElementById('closePortfolioEditor');
 const status=document.getElementById('portfolioEditorStatus');
 if(!launch||!panel)return;
 const DB_NAME='HGBPortfolioImageStore'; const STORE='images'; let db;
 const openPanel=()=>{panel.classList.add('open');scrim.classList.add('open');panel.setAttribute('aria-hidden','false');};
 const closePanel=()=>{panel.classList.remove('open');scrim.classList.remove('open');panel.setAttribute('aria-hidden','true');};
 launch.addEventListener('click',openPanel);close?.addEventListener('click',closePanel);scrim?.addEventListener('click',closePanel);
 function setStatus(message){if(status)status.textContent=message;}
 function openDB(){return new Promise((resolve,reject)=>{if(!('indexedDB'in window)){reject(new Error('Trình duyệt không hỗ trợ lưu ảnh cục bộ.'));return;}const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE);};req.onsuccess=()=>{db=req.result;resolve(db);};req.onerror=()=>reject(req.error);});}
 function put(key,value){return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
 function get(key){return new Promise((resolve,reject)=>{const req=db.transaction(STORE,'readonly').objectStore(STORE).get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
 function remove(key){return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
 function clearAll(){return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
 function all(){return new Promise((resolve,reject)=>{const req=db.transaction(STORE,'readonly').objectStore(STORE).getAllKeys();req.onsuccess=async()=>{try{const entries=[];for(const key of req.result)entries.push([key,await get(key)]);resolve(entries);}catch(e){reject(e);}};req.onerror=()=>reject(req.error);});}
 function optimize(file){return new Promise((resolve,reject)=>{if(!file.type.startsWith('image/')){reject(new Error('Vui lòng chọn file ảnh.'));return;}const reader=new FileReader();reader.onerror=()=>reject(reader.error);reader.onload=()=>{const img=new Image();img.onerror=()=>reject(new Error('Không đọc được ảnh này.'));img.onload=()=>{const max=1800,scale=Math.min(1,max/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.84));};img.src=reader.result;};reader.readAsDataURL(file);});}
 const projectSelectors={gft:'.project-wide .project-art',ecom:'.project[data-category="ecom"] .project-art',tuvi:'.art-tuvi',brand:'.art-brand',print:'.art-print',travel:'.art-travel'};
 function applyProjectImage(key,data){const target=document.querySelector(projectSelectors[key]);if(!target)return;if(key==='gft'){target.querySelectorAll('.browser,.art-label').forEach(el=>el.style.display='none');}else{target.querySelectorAll(':scope > *').forEach(el=>el.style.display='none');}let img=target.querySelector(':scope > img.uploaded-project-image');if(!img){img=document.createElement('img');img.className='uploaded-project-image';img.alt='Ảnh dự án portfolio';target.appendChild(img);}img.src=data;target.classList.add('has-upload');}
 async function restore(){try{await openDB();for(const key of Object.keys(projectSelectors)){const data=await get('project:'+key);if(data)applyProjectImage(key,data);}const portrait=await get('portrait');if(portrait){const card=document.querySelector('.portrait-card');if(card){card.style.backgroundImage=`url("${portrait}")`;card.classList.add('has-upload');card.querySelectorAll(':scope > *').forEach(el=>el.style.visibility='hidden');}}for(const gallery of ['chuangxin','vulin','tinfunding','travelplus','freelance']){const images=await get('gallery:'+gallery);if(images?.length)renderGallery(gallery,images);}setStatus('Ảnh đã lưu trên thiết bị này sẽ tự hiển thị khi mở lại bằng trình duyệt này.');}catch(e){setStatus('Không thể khởi tạo kho ảnh: '+e.message);}}
 function normalizeGalleryItem(item,i){return typeof item==='string'?{data:item,title:`Tác phẩm ${String(i+1).padStart(2,'0')}`,category:'Khác'}:{data:item.data||item.src||'',title:item.title||`Tác phẩm ${String(i+1).padStart(2,'0')}`,category:item.category||'Khác'};}
 const categories=['Product Visual','E-commerce Banner','Branding','Social Media','UI/UX','Website','Print Design','Campaign','Mockup','Video / Motion','Khác'];
 function ensureLightbox(){let box=document.getElementById('portfolioLightbox');if(box)return box;box=document.createElement('div');box.id='portfolioLightbox';box.className='portfolio-lightbox';box.innerHTML='<button type="button" class="lightbox-close" aria-label="Đóng ảnh">×</button><button type="button" class="lightbox-prev" aria-label="Ảnh trước">‹</button><figure><img alt="Xem tác phẩm"><figcaption></figcaption></figure><button type="button" class="lightbox-next" aria-label="Ảnh tiếp">›</button>';document.body.appendChild(box);box.addEventListener('click',e=>{if(e.target===box||e.target.closest('.lightbox-close'))box.classList.remove('open');});return box;}
 function openGalleryLightbox(name,index,items){const box=ensureLightbox();let current=index;const paint=()=>{const item=normalizeGalleryItem(items[current],current);box.querySelector('img').src=item.data;box.querySelector('figcaption').textContent=`${item.title} · ${item.category} · ${current+1}/${items.length}`;};box.querySelector('.lightbox-prev').onclick=()=>{current=(current-1+items.length)%items.length;paint();};box.querySelector('.lightbox-next').onclick=()=>{current=(current+1)%items.length;paint();};paint();box.classList.add('open');}
 function renderGallery(name,rawItems){const holder=document.querySelector(`[data-gallery="${name}"]`);if(!holder)return;const images=rawItems.map(normalizeGalleryItem);holder.innerHTML='';const toolbar=document.createElement('div');toolbar.className='gallery-toolbar';toolbar.innerHTML=`<div><strong>${images.length} tác phẩm</strong><span>Nhấn ảnh để phóng to · cuộn để xem toàn bộ</span></div><label class="gallery-add">＋ Thêm hình ảnh<input type="file" accept="image/*" multiple hidden></label>`;const addInput=toolbar.querySelector('input');addInput.addEventListener('change',async()=>{const files=[...(addInput.files||[])];if(!files.length)return;try{setStatus(`Đang thêm ${files.length} ảnh…`);for(const file of files){const data=await optimize(file);images.push({data,title:file.name.replace(/\.[^.]+$/,''),category:'Khác'});}await put('gallery:'+name,images);renderGallery(name,images);setStatus(`Đã thêm ${files.length} ảnh vào ${name}.`);}catch(e){setStatus('Không thêm được ảnh: '+e.message);}finally{addInput.value='';}});holder.appendChild(toolbar);const grid=document.createElement('div');grid.className='gallery-image-grid';images.forEach((item,i)=>{const tile=document.createElement('article');tile.className='mini-tile has-upload gallery-item';const preview=document.createElement('button');preview.type='button';preview.className='gallery-preview';preview.setAttribute('aria-label','Phóng to '+item.title);const img=document.createElement('img');img.src=item.data;img.alt=item.title;preview.appendChild(img);preview.addEventListener('click',()=>openGalleryLightbox(name,i,images));const title=document.createElement('input');title.className='gallery-title';title.value=item.title;title.setAttribute('aria-label','Tên tác phẩm');title.addEventListener('change',async()=>{images[i].title=title.value.trim()||`Tác phẩm ${i+1}`;await put('gallery:'+name,images);setStatus('Đã lưu tên tác phẩm.');});const category=document.createElement('select');category.className='gallery-category';category.setAttribute('aria-label','Phân loại tác phẩm');categories.forEach(c=>{const option=document.createElement('option');option.value=c;option.textContent=c;if(c===item.category)option.selected=true;category.appendChild(option);});category.addEventListener('change',async()=>{images[i].category=category.value;await put('gallery:'+name,images);setStatus('Đã lưu phân loại tác phẩm.');});const removeBtn=document.createElement('button');removeBtn.className='remove-local-image';removeBtn.type='button';removeBtn.textContent='×';removeBtn.setAttribute('aria-label','Xóa ảnh khỏi thư viện');removeBtn.addEventListener('click',async()=>{images.splice(i,1);await put('gallery:'+name,images);renderGallery(name,images);setStatus('Đã xóa ảnh khỏi thư viện '+name+'.');});tile.append(preview,title,category,removeBtn);grid.appendChild(tile);});holder.appendChild(grid);}
 document.querySelectorAll('[data-upload-target]').forEach(input=>input.addEventListener('change',async()=>{const file=input.files?.[0];if(!file)return;try{if(!db)await openDB();setStatus('Đang xử lý ảnh…');const data=await optimize(file);const key=input.dataset.uploadTarget;if(key==='portrait'){await put('portrait',data);const card=document.querySelector('.portrait-card');card.style.backgroundImage=`url("${data}")`;card.classList.add('has-upload');card.querySelectorAll(':scope > *').forEach(el=>el.style.visibility='hidden');}else{await put('project:'+key,data);applyProjectImage(key,data);}setStatus('Đã thêm ảnh thành công. Ảnh được lưu trong trình duyệt hiện tại.');}catch(e){setStatus('Chưa thêm được ảnh: '+e.message);}finally{input.value='';}}));
 document.querySelectorAll('[data-gallery-upload]').forEach(input=>input.addEventListener('change',async()=>{const files=[...(input.files||[])];if(!files.length)return;try{if(!db)await openDB();const name=input.dataset.galleryUpload;let images=await get('gallery:'+name)||[];setStatus(`Đang xử lý ${files.length} ảnh…`);for(const file of files)images.push({data:await optimize(file),title:file.name.replace(/\.[^.]+$/,''),category:'Khác'});await put('gallery:'+name,images);const row=document.querySelector(`[data-archive="${name}"]`);const archiveId=name==='vulin'?'vulin h':name;const panelId='archive-'+archiveId;const archivePanel=document.getElementById(panelId);if(archivePanel){archivePanel.classList.add('open');row?.classList.add('open');archivePanel.dataset.built='true';}renderGallery(name,images);setStatus(`Đã thêm ${files.length} ảnh vào thư viện ${name}.`);}catch(e){setStatus('Chưa thêm được ảnh: '+e.message);}finally{input.value='';}}));
 document.getElementById('clearPortfolioImages')?.addEventListener('click',async()=>{if(!confirm('Xóa toàn bộ ảnh đã lưu trong trình duyệt này?'))return;try{if(!db)await openDB();await clearAll();location.reload();}catch(e){setStatus('Không xóa được: '+e.message);}});
 restore();
})();


/* Content manager: edits text in this browser and remembers it via localStorage. */
(()=>{
 const fields=[...document.querySelectorAll('[data-content-field]')];
 const defaults={};
 const selectors={
  name:()=>document.querySelector('.identity-text'),
  eyebrow:()=>document.querySelector('.hero-copy .eyebrow'),
  heroTitle:()=>document.querySelector('.hero-copy h1'),
  intro:()=>document.querySelector('.hero-intro'),
  about1:()=>document.querySelector('.about-detail .big-copy'),
  about2:()=>document.querySelectorAll('.about-detail > p')[1],
  about3:()=>document.querySelectorAll('.about-detail > p')[2],
  gftTitle:()=>document.querySelector('.project-wide .project-meta h3'),
  gftDesc:()=>document.querySelector('.project-wide .project-description'),
  ecomTitle:()=>document.querySelector('.project[data-category="ecom"] .project-meta h3'),
  ecomDesc:()=>document.querySelector('.project[data-category="ecom"] .project-description'),
  tuviTitle:()=>document.querySelectorAll('#projects .project')[2]?.querySelector('.project-meta h3'),
  tuviDesc:()=>document.querySelectorAll('#projects .project')[2]?.querySelector('.project-description'),
  brandDesc:()=>document.querySelector('.project[data-category="brand"] .project-description'),
  printDesc:()=>document.querySelector('.project[data-category="print"] .project-description'),
  travelDesc:()=>document.querySelectorAll('#projects .project')[5]?.querySelector('.project-description'),
  contactDesc:()=>document.querySelector('.contact-copy'),
  email:()=>document.querySelector('#copyEmail')
 };
 const read=(key)=>{const el=selectors[key]?.();if(!el)return '';if(key==='name')return el.childNodes[0]?.textContent?.trim()||'HÀ GIA BẢO';if(key==='eyebrow')return el.textContent.trim();if(key==='heroTitle')return el.innerText.replace(/\n/g,' ').trim();if(key==='email')return el.dataset.email||'';return el.textContent.trim();};
 const apply=(key,value)=>{const el=selectors[key]?.();if(!el)return;if(key==='name'){const small=el.querySelector('small');el.textContent=value+' ';if(small){el.appendChild(small);}return;}if(key==='eyebrow'){const icon=el.querySelector('i');el.textContent=value;if(icon)el.prepend(icon);return;}if(key==='heroTitle'){const parts=value.split(/\s+/);if(parts.length>2){const first=parts.slice(0,2).join(' '),rest=parts.slice(2).join(' ');el.innerHTML='';el.append(document.createTextNode(first));el.append(document.createElement('br'));const em=document.createElement('em');em.textContent=rest;el.append('makes ');el.append(em);}else el.textContent=value;return;}if(key==='email'){el.dataset.email=value;const mail=el.parentElement?.querySelector('a[href^="mailto:"]');if(mail)mail.href='mailto:'+value;return;}el.textContent=value;};
 fields.forEach(field=>{const key=field.dataset.contentField;defaults[key]=read(key);});
 function loadContent(){try{const saved=JSON.parse(localStorage.getItem('hgbPortfolioContent')||'{}');fields.forEach(field=>{const key=field.dataset.contentField;field.value=saved[key]??defaults[key]??'';if(saved[key]!==undefined)apply(key,saved[key]);});}catch(e){console.warn('Could not load saved portfolio text',e);}}
 document.getElementById('savePortfolioContent')?.addEventListener('click',()=>{const data={};fields.forEach(field=>{const key=field.dataset.contentField;data[key]=field.value.trim();apply(key,data[key]);});try{localStorage.setItem('hgbPortfolioContent',JSON.stringify(data));const email=document.querySelector('#copyEmail');if(email)email.dataset.email=data.email||email.dataset.email;const toast=document.querySelector('#portfolioEditorStatus');if(toast)toast.textContent='Đã lưu nội dung trên trình duyệt này.';}catch(e){const toast=document.querySelector('#portfolioEditorStatus');if(toast)toast.textContent='Không lưu được nội dung: '+e.message;}});
 document.getElementById('resetPortfolioContent')?.addEventListener('click',()=>{if(!confirm('Khôi phục nội dung chữ mặc định?'))return;localStorage.removeItem('hgbPortfolioContent');fields.forEach(field=>{const key=field.dataset.contentField;field.value=defaults[key]||'';apply(key,defaults[key]||'');});const toast=document.querySelector('#portfolioEditorStatus');if(toast)toast.textContent='Đã khôi phục chữ mặc định.';});
 loadContent();
})();


/* Export handover package: text + every uploaded image, ready to send back for final website build. */
(()=>{
 const button=document.getElementById('exportPortfolioPackage');
 const status=document.getElementById('portfolioEditorStatus');
 if(!button)return;
 const say=(s)=>{if(status)status.textContent=s;};
 const openDb=()=>new Promise((resolve,reject)=>{const req=indexedDB.open('HGBPortfolioImageStore',1);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
 const readAllImages=(db)=>new Promise((resolve,reject)=>{const tx=db.transaction('images','readonly');const store=tx.objectStore('images');const req=store.openCursor();const out={};req.onsuccess=()=>{const c=req.result;if(c){out[c.key]=c.value;c.continue();}else resolve(out);};req.onerror=()=>reject(req.error);});
 button.addEventListener('click',async()=>{
  const original=button.textContent;button.disabled=true;button.textContent='Đang gom ảnh và nội dung…';
  try{
   if(typeof JSZip==='undefined')throw new Error('Chưa tải được bộ nén ZIP. Kiểm tra mạng rồi tải lại trang.');
   const db=await openDb();
   const images=await readAllImages(db);
   const content={};document.querySelectorAll('[data-content-field]').forEach(el=>content[el.dataset.contentField]=el.value.trim());
   // Ensure saved content reflects the current editor fields before packaging.
   try{localStorage.setItem('hgbPortfolioContent',JSON.stringify(content));}catch{}
   const zip=new JSZip();
   zip.file('portfolio-content.json',JSON.stringify({format:'HGB-PORTFOLIO-HANDOVER',version:1,createdAt:new Date().toISOString(),content,images},null,2));
   zip.file('README.txt','GÓI BÀN GIAO PORTFOLIO HÀ GIA BẢO\n\nFile portfolio-content.json chứa toàn bộ nội dung chữ đã nhập và ảnh đã upload (dạng data URL).\nHãy gửi nguyên file ZIP này vào cuộc trò chuyện ChatGPT để cập nhật vào source website hoàn chỉnh.\nChưa phải bản public; sau khi cập nhật source, hãy đưa thư mục website lên GitHub Pages.\n');
   const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:5}});
   const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='ha-gia-bao-portfolio-handover.zip';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
   say(`Đã xuất gói bàn giao thành công: ${Object.keys(images).length} mục ảnh và ${Object.keys(content).length} trường nội dung. Gửi file ZIP vừa tải cho ChatGPT.`);
  }catch(e){say('Xuất gói chưa thành công: '+e.message+' Nếu trình duyệt chặn tải xuống, hãy cho phép tải file và thử lại.');}
  finally{button.disabled=false;button.textContent=original;}
 });
})();

/* Static galleries imported from the user's handover ZIP: accessible lightbox + keyboard navigation. */
(()=>{
 const box=document.getElementById('portfolioLightbox');
 if(!box)return;
 const img=document.getElementById('lightboxImage');
 const title=document.getElementById('lightboxTitle');
 const category=document.getElementById('lightboxCategory');
 const counter=document.getElementById('lightboxCounter');
 const groups={};
 document.querySelectorAll('.portfolio-gallery-card').forEach(card=>{
   const key=card.dataset.galleryKey;
   (groups[key] ||= []).push({
     src:card.querySelector('img')?.getAttribute('src')||'',
     title:card.querySelector('.gallery-card-meta strong')?.textContent||'Untitled',
     category:card.querySelector('.gallery-card-meta small')?.textContent||''
   });
   card.addEventListener('click',()=>{activeKey=key;activeIndex=Number(card.dataset.lightboxIndex)||0;render();box.classList.add('open');box.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';});
 });
 let activeKey='',activeIndex=0;
 function render(){
   const items=groups[activeKey]||[];if(!items.length)return;
   activeIndex=(activeIndex+items.length)%items.length;
   const item=items[activeIndex];img.src=item.src;img.alt=item.title;title.textContent=item.title;category.textContent=item.category;counter.textContent=`${activeIndex+1} / ${items.length}`;
 }
 function close(){box.classList.remove('open');box.setAttribute('aria-hidden','true');document.body.style.overflow='';img.removeAttribute('src');}
 function move(n){activeIndex+=n;render();}
 box.querySelector('.lightbox-close')?.addEventListener('click',close);
 box.querySelector('.lightbox-prev')?.addEventListener('click',()=>move(-1));
 box.querySelector('.lightbox-next')?.addEventListener('click',()=>move(1));
 box.addEventListener('click',e=>{if(e.target===box)close();});
 document.addEventListener('keydown',e=>{if(!box.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')move(-1);if(e.key==='ArrowRight')move(1);});
})();
