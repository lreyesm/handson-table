import { MatPaginatorIntl } from '@angular/material/paginator';

/**
 * @brief This function customize the appearance of the paginator
 *
 */
export function CustomPaginator() {
    const customPaginatorIntl = new MatPaginatorIntl();
    customPaginatorIntl.itemsPerPageLabel = 'Movies per page';
    return customPaginatorIntl;
}
