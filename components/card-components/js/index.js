// Components

export const changeColor = async function(elem){
    try{
        elem.style.backgroundColor = "blue";
    } catch(e){
        console.error(e);
    }
}




// Main js

let component = document.querySelector('.component');

component.addEventListener('click',async function(){
    try{
        (await import('/components/card-components/js/index.js')).changeColor(component);
    } catch(e){
        console.error(e);
    }
})