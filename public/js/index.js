const projectsContainer = document.querySelector('.projects-container');

if (projectsContainer) {
    projectsContainer.addEventListener('click', (e) => {
        const classes = e.target.className.split(/\s+/);
        const isDelete = classes.includes('btn-delete');

        if (isDelete) {
            const id = e.target.parentNode.parentNode.parentNode.dataset.id;
            const btnContinueAction = document.getElementById('btn-continue-action');
            btnContinueAction.setAttribute('href', `/delete-project/${id}`);
        }
    });
}