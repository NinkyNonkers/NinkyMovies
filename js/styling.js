const dropdownMenuA = document.getElementById("ddmenuA");
const dropdownMenuB = document.getElementById("ddmenuB");

//faster alternative to using jquery lol, I know its horrible but really its readable and considering the performance benefit theres no need to heavily design this
var dropDownToggledA = undefined;
var dropDownToggledB = undefined;

function dropDownAClicked() {
    if (dropDownToggledA === undefined)
        dropDownToggledA = true;
    dropDownToggledA = !dropDownToggledA;
    if (dropDownToggledA) {
        dropdownMenuA.style.display = 'block';
        return;
    }
    dropdownMenuA.style.display = 'none'
}

function dropDownBClicked() {
    if (dropDownToggledA === undefined)
        dropDownToggledA = false;
    dropDownToggledB = !dropDownToggledB;
    if (dropDownToggledB) {
        dropdownMenuB.style.display = 'block';
        return;
    }
    dropdownMenuB.style.display = 'none'
}