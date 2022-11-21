export const animateButton = async function(){
    try{
        (await import('/src/lib/helpers/switchClass.js')).switchClass('.line-2','zeroOpacity','setOpacity');
        (await import('/src/lib/helpers/switchClass.js')).switchClass('.line-1','rotate-line-1','');
        (await import('/src/lib/helpers/switchClass.js')).switchClass('.line-3','rotate-line-3','');
        (await import('/src/lib/helpers/switchClass.js')).switchClass('.mobileMenuContainer','open','close');
    } catch(e){
        console.error(e);
    }
}