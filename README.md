# Working Spec Client API Example

## HTML

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

## CSS

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

## JavaScript

```javascript
// constants

const baseUrl = 'https://workingspec.me'
const companyAbbrev = 'rk'

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