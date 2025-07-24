# Working Spec Ltd - Website Embed API Example

- [Working Spec Ltd - Website Embed API Example](#working-spec-ltd---website-embed-api-example)
  - [Overview](#overview)
  - [Working Spec API](#working-spec-api)
  - [Listings](#listings)
    - [HTML](#html)
    - [CSS](#css)
    - [JavaScript](#javascript)

## Overview

This is a working example of the web code used to:
* generate a selection grid of Working Spec 3D interactive models
* respond to user selection by launching the Working Spec WebGL player in a popup window.

The 3 files used in this demo are in the _www_ folder:

* _index.html_ 
* _main.css_
* _main.js_

To run this demo simply:

*  Copy the _www_ folder and contents to an empty folder on your machine.
*  Open a new browser tab.
*  In the address bar enter: _file://<your folder>/www/index.html_.
*  Your browser should display a grid of Working Spec models. 
*  Click on one of models in the grid.
*  A popup window should load the Working Spec webGL player and display the selected model,.
  
## Working Spec API

The Javascript file _main.js_ calls the Working Spec API with route: _/api/client/v1/company/<abbrev>_.

Here <abbrev> refers to your company code. e.g. _jh_ will return model data for _James Hardie_ 

The baseUrl for this API call will be one of:  

* https://workingspec.com - New Zealand (default) server
* https://workingspec.com.au - Australian server

The API call returns json in the form:

```json
{
    "abbrev": "jh",
    "name": "James Hardie",
    "externalUri": "https://www.jameshardie.co.nz",
    "logomarkUri": "https://workingspec.com/img-files/jh-logomark.svg",
    "brands": [
        {
            "abbrev": "jc",
            "name": "JH Cladding",
            "products": [
                {
                    "abbrev": "axn",
                    "name": "Axon Panel",
                    "details": [
                        {
                            "abbrev": "jh-axn-mfl",
                            "name": "Horizontal joint at floor joist",
                            "detailSku": "Figure 29 - Axon Panel CLD",
                            "videoId": "",
                            "externalUri": "",
                            "previewImageUri": "https://workingspec.com/files/jh-axn-mfl/3d-model.jpg"
                        }
                        .... repeated
                    ]
                }
            ]
        }
    ]
}
```

Working Spec model database hierachy is: _Company -> Brand -> Product -> Detail_

A call to _/api/client/v1/company/<abbrev>_ will return _json_ information for all company models.

Here is an example Javascript API call.

```javascript
// This call will return json for all 'jh' (James Hardie) models.
const res = await fetch('https://workingspec.com/api/client/v1/company/jh')
```

## Listings

The following list the code in the example files in the _www_ folder.

### HTML

Filename: _www/index.html_

```html
<!doctype html>
<html>

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Working Spec API Example</title>

  <link rel="stylesheet" href="main.css">
</head>

<body>
  <h1>Working Spec API Example</h1>
  <h2>Details</h2>

  <ul id="detail-grid"></ul>

  <dialog id="detail-viewer">
    <form><button formmethod="dialog">✖</button></form>
    <iframe autofocus></iframe>
  </dialog>

  <template id="detail-grid-item-template">
    <li class="detail-grid-item">
      <img class="detail-company-logo">
      <img class="detail-image">
      <h3 class="detail-name"></h3>
      <h4>
        <strong class="brand-name"></strong>:
        <span class="product-name"></span>
      </h4>
      <p class="detail-abbrev"><small></small></p>
    </li>
  </template>

  <script src="main.js"></script>
</body>

</html>
```


### CSS

Filename: _www/main.css_

```css
html {
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  padding: 2rem;
}

*,
*:before,
*:after {
  box-sizing: inherit;
}

body,
h1,
/* leave margin on h2 for cleaner spacing */
h3,
h4,
p {
  margin: 0;
}

h1 {
  font-weight: normal;
}

/* detail grid */

#detail-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 0;
}

.detail-grid-item {
  background-color: #eee;
  color: #111;

  cursor: pointer;

  padding: 1rem;
  width: 16rem;

  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-grid-item h3,
.detail-grid-item h4 {
  font-size: 1rem;
  font-weight: normal;
}

.detail-grid-item h3 {
  flex-grow: 1;
}

.detail-grid-item .detail-company-logo {
  height: 3rem;
  object-fit: contain;
  object-position: left;
}

.detail-grid-item .detail-abbrev {
  text-align: right;
}

/* detail viewer */

#detail-viewer {
  border: none;
  width: 90vw;
  height: 90vh;
  overflow: hidden;
  position: relative;
  padding: 1.5rem;
}

#detail-viewer form {
  position: absolute;
  top: 0;
  right: 0;
}

#detail-viewer iframe {
  border: none;
  width: 100%;
  height: 100%;
}

#detail-viewer::backdrop {
  backdrop-filter: blur(1rem);
}
```

### JavaScript

Filename: _www/main.js_


```javascript
// constants

// The baseUrl for this API call will be one of:  
// * https://workingspec.com - New Zealand (default) server
// * https://workingspec.com.au - Australian server
const baseUrl = 'https://workingspec.com'

const companyAbbrev = 'jh' // The company abbrev for your company.  e.g. 'jh' = James Hardie 

const apiUrl = `${baseUrl}/api/client/v1/company/${companyAbbrev}`

// get dom elements

const detailsHeader = document.querySelector('h2')

const detailGridItemTemplate = document.querySelector(
  '#detail-grid-item-template'
)

const detailViewer = document.querySelector('#detail-viewer')
const detailViewerEmbed = detailViewer.querySelector('iframe')

const detailGrid = document.querySelector('#detail-grid')

// populate details

const start = async () => {
  // fetch data

  const res = await fetch(apiUrl)

  if (!res.ok) {
    throw Error(`${res.status}: ${res.statusText}`)
  }

  const company = await res.json()

  detailsHeader.textContent = `${company.name} Details`

  // flatten company->brands->products->details into a single list
  for (const brand of company.brands) {
    for (const product of brand.products) {
      for (const detail of product.details) {
        // get template elements

        const gridItemTemplate = detailGridItemTemplate.content.cloneNode(true)

        const detailGridItem = gridItemTemplate.querySelector(
          '.detail-grid-item'
        )

        const detailCompanyLogo = detailGridItem.querySelector(
          '.detail-company-logo'
        )

        const detailImage = detailGridItem.querySelector('.detail-image')
        const detailName = detailGridItem.querySelector('.detail-name')
        const productName = detailGridItem.querySelector('.product-name')
        const brandName = detailGridItem.querySelector('.brand-name')
        const detailAbbrev = detailGridItem.querySelector(
          '.detail-abbrev small'
        )

        // populate detail grid item

        detailCompanyLogo.alt = company.name
        detailCompanyLogo.src = company.logotypeUri || company.logomarkUri

        detailImage.alt = detail.name
        detailImage.src = detail.previewImageUri

        detailName.textContent = detail.name
        productName.textContent = product.name
        brandName.textContent = brand.name
        detailAbbrev.textContent = detail.abbrev

        // show detail viewer on click

        detailGridItem.addEventListener('click', () => {
          detailViewerEmbed.src = `${baseUrl}/embed/${detail.abbrev}`

          detailViewer.showModal()
        })

        // add to grid

        detailGrid.append(detailGridItem)

        // next detail
      }
      // next product
    }
    // next brand
  }
  // done
}

start().catch(console.error)
```