const dropdownMenuA = document.getElementById("ddmenuA");
const dropdownMenuB = document.getElementById("ddmenuB");

//faster alternative to using jquery lol, I know its horrible but really its readable and considering the performance benefit theres no need to heavily design this
var dropDownToggledA = false;
var dropDownToggledB = false;

function dropDownAClicked() {
    dropDownToggledA = !dropDownToggledA;
    if (dropDownToggledA) {
        dropdownMenuA.style.display = 'block';
        return;
    }
    dropdownMenuA.style.display = 'none'
}

function dropDownBClicked() {
    dropDownToggledB = !dropDownToggledB;
    if (dropDownToggledB) {
        dropdownMenuB.style.display = 'block';
        return;
    }
    dropdownMenuB.style.display = 'none'
}