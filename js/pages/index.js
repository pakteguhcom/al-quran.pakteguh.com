import apiEndpoint from '../constant/api-endpoint.js'

document.addEventListener("DOMContentLoaded", main)

/**
* Main function
*/
async function main() {
    const endpoint = apiEndpoint.listSurah.url

    try {
        const response = await fetch(endpoint)
        const responseJSON = await response.json()
        const quranData = responseJSON.data
        renderListSurahElements(quranData)
    } catch (trace) {
        console.error(trace)
    }
}

/**
 * Get Content Container DOM Element
 */
function getContentContainer () {
    return document.querySelector('#content')
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
}