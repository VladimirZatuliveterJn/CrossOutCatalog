
async function getData(filePath)
{
    const response = await fetch(`./data/${filePath}`);
    return await response.json();
}

function getSelectedValue(selectId) {
    var rarity = document.getElementById(selectId);
    var selectedIndex = rarity.selectedIndex
    var selectedValue = rarity.options[selectedIndex].value
    return selectedValue
}

async function getParams(depencency) {
    // example: "common/cabin/eger"
    let parts = depencency.split('/'); // Split the string by '/'
    objectName = parts.pop(); // Remove the last element from the array
    
    fileName = parts.join('/') + '.json'
    jsonData = await getData(fileName)
    
    if (jsonData === undefined)
        throw new Error(`File is not found '${fileName}'.`)

    object = findObjectByName(jsonData, objectName)
    
    if (object === null)
        throw new Error(`Object '${objectName}' is not found in the file '${fileName}'.`)
    
    console.log('getParams returned object =', object)

    return object
}

function findObjectByName(data, name) {
    for (const obj of data) {
        if (obj.name === name) {
            return obj;
        }
    }
    return null; // If the object is not found, return null
}

async function onSelect() {
    var cards = document.getElementById("cards");
    cards.innerHTML = "";
    
    rarity = getSelectedValue("rarity")
    moduleType = getSelectedValue("moduleType")
    
    dataFileName = `${rarity}/${moduleType}.json`

    json = await getData(dataFileName)

    console.log(dataFileName)

    for (const item of json) {
        img = `./img/${rarity}/${moduleType}/${item.name}.webp`
        
        console.log(item.name, item.dependency)

        item.iron = item.iron ?? 0
        item.cuprum = item.cuprum ?? 0
        item.plastic = item.plastic ?? 0
        item.wire = item.wire ?? 0
        item.shell = item.shell ?? 0
        item.battery = item.battery ?? 0

        if (item.dependency !== undefined)
        {
            for (const dependency of item.dependency)
            {
                console.log("dependecny:", dependency)

                params = await getParams(dependency)
                item.iron += params.iron ?? 0
                item.cuprum += params.cuprum ?? 0
                item.plastic += params.plastic ?? 0
                item.wire += params.wire ?? 0
                item.shell += params.shell ?? 0
                item.battery += params.battery ?? 0
            }
        }

        cardHtml = `
            <div class="card" style="width: 18rem;">
                <img src="${img}" class="card-img-top" alt="...">
                <div class="card-body">
                <h5 class="card-title">${item.displayName}</h5>
                <p class="card-text">
                    <p>Ресурсы:</p>
                    <ul>    
                        <li>Железо: ${item.iron}</li>
                        <li>Медь: ${item.cuprum}</li>
                        <li>Пластик: ${item.plastic}</li>
                        <li>Провода: ${item.wire}</li>
                        <li>Аккумуляторы: ${item.battery}</li>
                        <li>Гильзы: ${item.shell}</li>

                    </ul>
                    <p>Зависит от:</p>
                    <ul>   
                        ${item.dependency?.map(e => `<li>${e}</li>`)?.join('')}                                               
                    </ul>                    
                </p>
            </div>
        `            
        cards.innerHTML += cardHtml
    }
}
