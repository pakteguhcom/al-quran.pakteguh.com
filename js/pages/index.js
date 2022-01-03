import apiEndpoint from '../constant/api-endpoint.js'

document.addEventListener("DOMContentLoaded", main)

/**
* Main function
*/
async function main() {
    const endpoint = apiEndpoint.listSurah.url
    const loadingAnimation = getLoadingAnimationContainer()
    const mainApp = getMainAppContainer()

    try {
        mainApp.style.display = 'none'
        loadingAnimation.style.display = 'flex'
        
        const response = await fetch(endpoint)
        const responseJSON = await response.json()
        const quranData = responseJSON.data
        renderListSurahElements(quranData)
        
        mainApp.style.display = 'block'
        loadingAnimation.style.display = 'none'
    } catch (trace) {
        console.error(trace)
    }
}

/**
 * Get Main App Element Container
 * @returns
 */
function getMainAppContainer () {
    return document.querySelector('#mainApp')
}

/**
 * Get Content Container DOM Element
 */
function getContentContainer () {
    return document.querySelector('#content')
}

/**
 * Get Loading Animation Element Container
 * @returns
 */
function getLoadingAnimationContainer () {
    return document.querySelector('.loadingAnimation')
}

/**
 * Get Navbar DOM element container
 */
function getNavbarContainer () {
    return document.querySelector('#navbar')
}

/**
 * Build element for surah item
 * @param {object} quranData
 * @param {string} quranData.name
 * @param {string} quranData.translation
 * @param {string} quranData.type
 * @param {string|number} quranData.numberSurah
 * @param {string|number} quranData.ayahCount
 * @returns
 */
function SurahItem({ name, translation, type, numberSurah, ayahCount }) {
    return `
        <a class="surahItem" href="detail.html?numberSurah=${numberSurah}">
            <div class="nameInfo">
                <div class="name">${name}</div>
                <div class="translation">${translation}</div>
            </div>
            <div class="additionalInfo">
                <div>${type}</div>
                <div>${numberSurah}:${ayahCount}</div>
            </div>
        </a>
    `
}

/**
 * Render surah item elements based from api data
 * @param {*} quranData 
 */
function renderListSurahElements(quranData) {
    const searchBar = getNavbarContainer().querySelector('.searchContainer input')

    const surahListElements = quranData.reduce((elements, surah) => {
        return elements += SurahItem({
            name: surah.asma.id.long,
            translation: surah.asma.translation.id,
            type: surah.type.id,
            numberSurah: surah.number,
            ayahCount: surah.ayahCount
        })
    }, '')

    getContentContainer().innerHTML = surahListElements
    
    searchBar.oninput = (event) => {
        const filteredData = quranData.filter(surah => {
            const surahName = surah.asma.id.long.toLowerCase().replace(/\'+/g, '')
            const searchQuery = event.target.value.toLowerCase()
            return surahName.includes(searchQuery)
        })

        getContentContainer().innerHTML = filteredData.reduce((elements, surah) => {
            return elements += SurahItem({
                name: surah.asma.id.long,
                translation: surah.asma.translation.id,
                type: surah.type.id,
                numberSurah: surah.number,
                ayahCount: surah.ayahCount
            })
        }, '')
    }
}