export default function resetSearchInput() {

    const clearFiltersBtn = document.querySelector('.clearFilters');

    if (!clearFiltersBtn) return;

    clearFiltersBtn.addEventListener('click', e => {
        const searchInput = document.querySelector('.search');
        const filterSelect = document.querySelector('.filterSelect');

        searchInput.value = '';
        filterSelect.selectedIndex = 0;
    });
}

resetSearchInput();
