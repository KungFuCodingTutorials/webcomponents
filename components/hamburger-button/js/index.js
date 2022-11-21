export const hamburgerButton = async function(elementClass){
    if(!elementClass){
        return;
    }
    let hamburger = document.querySelector(elementClass);
    hamburger.addEventListener('click',async function(){
        (await import('./animateButton.js')).animateButton();
    });
};