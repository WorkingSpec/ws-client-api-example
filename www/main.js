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
