let searchTermGlobal = "";

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
}

function renderMeetings(meetings, container) {
    container.innerHTML = '';

    meetings.forEach(meeting => {
        const videoId = new URLSearchParams(new URL(meeting.videoLink).search).get('v');
        const title = `${meeting.department} Meeting: ${formatDate(meeting.date)}`.replaceAll(new RegExp(searchTermGlobal, 'gi'), (match) => `<span class="highlight">${match}</span>`);
        const summary = meeting.summary.replaceAll(new RegExp(searchTermGlobal, 'gi'), (match) => `<span class="highlight">${match}</span>`);

        container.innerHTML += `
            <div class="meeting">
                <div class="videoContainer">
                    <div class="thumbnailContainer" onclick="openVideo('${videoId}', this)">
                        <img class="thumbnail" src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg">
                        <div class="playButton">&#9658;</div>
                    </div>
                </div>
                <div class="infoContainer">
                    <h2>${title}</h2>
                    <p class="${container.firstChild ? 'shortSummary' : 'fullSummary'}">${summary}</p>
                    <button ${meeting.notesLink ? `onclick="window.open('${meeting.notesLink}', '_blank')"` : 'disabled'}>${meeting.notesLink ? 'View Meeting Minutes' : 'Minutes Unavailable'}</button>
                </div>
            </div>`;
    });
}

function openVideo(videoId, thumbnailContainer) {
    thumbnailContainer.outerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
}

fetch('meetings.json')
    .then(response => response.json())
    .then(data => {
        const originalData = data.meetings;
        const meetingContainer = document.getElementById('meetingContainer');

        originalData.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort meetings by date, descending

        renderMeetings(originalData, meetingContainer);

        document.getElementById('searchBar').addEventListener('input', (event) => {
            searchTermGlobal = event.target.value.toLowerCase();

            const filteredMeetings = originalData.filter(meeting => {
                const searchableString = [meeting.title, meeting.summary].join(' ').toLowerCase();
                return searchableString.includes(searchTermGlobal);
            });

            renderMeetings(filteredMeetings, meetingContainer);
        });

        document.getElementById('clearButton').addEventListener('click', () => {
            searchTermGlobal = '';
            document.getElementById('searchBar').value = '';
            renderMeetings(originalData, meetingContainer);
        });
    })
    .catch(error => console.error('Error:', error));
