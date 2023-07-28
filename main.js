
function getData(fileName, draw)
{
    fetch(`./data/${fileName}`)
        .then((response) => response.json())
        .then((json) => draw(json));
}

function getSelectedValue(selectId) {
    var rarity = document.getElementById(selectId);
    var selectedIndex = rarity.selectedIndex
    var selectedValue = rarity.options[selectedIndex].value
    return selectedValue
}

function onSelect() {
    var cards = document.getElementById("cards");
    cards.innerHTML = "";
    
    rarity = getSelectedValue("rarity")
    moduleType = getSelectedValue("moduleType")
    
    dataFileName = `${rarity}-${moduleType}.json`

    getData(dataFileName, (json) => {
        //alert(json)
        for (const item of json) {
            cardHtml = `
                <div class="card" style="width: 18rem;">
                    <img src="${item.img}" class="card-img-top" alt="...">
                    <div class="card-body">
                    <h5 class="card-title">Машина "Крутяк #${item.type}"</h5>
                    <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                    <a href="#" class="btn btn-primary">Go somewhere</a>
                    </div>
                </div>
            `            
            cards.innerHTML += cardHtml
        }
    })
}