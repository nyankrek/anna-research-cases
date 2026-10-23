const bar = document.getElementById('scroll-progress');
function updateProgress(){const max=document.documentElement.scrollHeight-window.innerHeight;bar.style.width=(max>0?Math.min(100,window.scrollY/max*100):0)+'%'}
window.addEventListener('scroll',updateProgress,{passive:true});
window.addEventListener('resize',updateProgress);
updateProgress();
