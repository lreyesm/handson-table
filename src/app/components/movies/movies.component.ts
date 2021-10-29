import { Component, HostListener, ViewChild, OnInit } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import Handsontable from 'handsontable';
import { NgxSpinnerService } from 'ngx-spinner';
import { CustomPaginator } from 'src/app/configurations/custom-paginator-configuration';
import { Movie } from '../../interfaces/movie';
import { MovieService } from '../../services/movie.service';
import { UtilsService } from '../../services/utils.service';

@Component({
    selector: 'app-movies',
    templateUrl: './movies.component.html',
    styleUrls: ['./movies.component.scss'],
    providers: [
        { provide: MatPaginatorIntl, useValue: CustomPaginator() }, // Here
    ],
})
export class MoviesComponent implements OnInit {
    @ViewChild('handson') hot?: Handsontable;
    @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger?: MatMenuTrigger;
    length = 0; //movie count in current table
    pageSize = 100; //limit of query
    lastPageIndex = 0;
    pageSizeOptions: number[] = [100];
    readonlyColumns = ['id', 'releaseDate', 'createdAt', 'updatedAt', 'deletedAt'];
    columnNames = [
        'id',
        'budget',
        'originalLang',
        'originalTitle',
        'overview',
        'popularity',
        'releaseDate',
        'revenue',
        'runtime',
        'status',
        'tagline',
        'title',
        'voteAverage',
        'voteCount',
        'createdAt',
        'updatedAt',
        'deletedAt',
    ];
    dataset: any[] = [];
    copyDataset: any;
    columnMove: any = true;
    menuTopLeftPosition = { x: '0', y: '0' };
    menuOptions = ['Open', 'Delete'];
    dropIndex: any;
    table?: Handsontable;
    id: string = 'localhost';
    action: string = 'recargar';
    selectedData: any;
    loading = true;
    innerHeight: any = 1080;
    customHeight: any = '1080px';
    firstLoad = true;
    /**
     * @brief The column order of the table is loaded on the constructor function
     *
     * @param  {MovieService} movieService : Service for the movies request
     * @param  {UtilsService} _utilsService : An utility service
     * @param  {NgxSpinnerService} spinner : The spinner service for loading animation
     */
    constructor(
        private movieService: MovieService,
        private _utilsService: UtilsService,
        private spinner: NgxSpinnerService
    ) {
        this.loadSavedColumnOrder();
    }

    /**
     * @brief Loads the first page of the movies
     *
     * @returns Promise
     */
    async ngOnInit(): Promise<void> {
        this.showLoading(true);
        this.innerHeight = window.innerHeight;
        this.customHeight = `${innerHeight - 56}px`;
        this.showLoading(true);
        try {
            this.dataset = await this.movieService.getMovies(1);
        } catch (error) {
            console.log('******************** error ********************');
            console.error(error);
            this._utilsService.openSnackBar('Failed loading movies', 'error');
        }
        this.firstLoad = false;
        this.showLoading(false);
        setTimeout(() => {
            try {
                this.addHooks();
            } catch (err) {
                console.log('************* err *************');
                console.log(err);
            } //waits for tha table to load
        }, 500);
    }

    /**
     * @brief   Changes the table height when on windows resize event
     * @param  {any} event: Resize event, not using the variable
     */
    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.innerHeight = window.innerHeight;
        this.customHeight = `${innerHeight - 56}px`;
    }

    async doubleClickedRow(event: any) {
        console.log('************* event *************');
        console.log(event);
        if (this.selectedData) {
            await this.openMovie(this.selectedData.row);
        }
    }

    /**
     * @brief Add hooks to handson table, After selection hook
     * After selection hook and after a change hook
     * @returns void
     */
    addHooks(): void {
        this.selectedData = undefined;
        (this.hot as any).__hotInstance.addHook(
            'afterSelection',
            (
                row: any,
                column: any,
                row2: any,
                column2: any,
                preventScrolling: any,
                selectionLayerLevel: any
            ) => {
                const selectedData = {
                    row: row,
                    column: column,
                    row2: row2,
                    column2: column2,
                    preventScrolling: preventScrolling,
                    selectionLayerLevel: selectionLayerLevel,
                };
                this.selectedData = selectedData;
            }
        );
        (this.hot as any).__hotInstance.addHook('afterChange', async (changes: any) => {
            if (changes && changes.length > 0) {
                if (changes[0] /* row */) {
                    const previousValue = changes[0][2];
                    const actualValue = changes[0][3];
                    if (previousValue !== actualValue) {
                        const row = changes[0][0];
                        const column = changes[0][1];
                        if (column) {
                            let movie: Movie = this.dataset[row];
                            if (movie) {
                                movie[`${column}` as keyof Movie] = actualValue;
                                const res = await this.movieService.updateMovie(
                                    movie,
                                    movie.id!.toString()
                                );
                                if (res) {
                                    this._utilsService.openSnackBar('Movie updated successfully');
                                } else {
                                    this._utilsService.openSnackBar(
                                        'Failed updating movie',
                                        'error'
                                    );
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * @brief Loads the order of the columns
     * Access the localStorage and get the column move array
     * @returns void
     */
    loadSavedColumnOrder(): void {
        let saveManualColumnMove = localStorage.getItem('localhost_manualColumnMove');
        if (saveManualColumnMove) {
            saveManualColumnMove = saveManualColumnMove.replace('[', '');
            saveManualColumnMove = saveManualColumnMove.replace(']', '');
            const tempArray = saveManualColumnMove.split(',');
            try {
                const intArray = tempArray.map((e) => parseInt(e));
                console.log('************* intArray *************');
                console.log(intArray);
                this.columnMove = intArray;
                console.log('************* this.columnMove *************');
                console.log(this.columnMove);
            } catch (err) {
                this._utilsService.openSnackBar('Failed loading column order', 'error');
            }
        }
    }

    /**
     * @brief Opens a form to add a new movie
     *
     * @returns Promise : Returns nothing
     */
    async addMovie(): Promise<void> {
        const openedMovie = await this._utilsService.openMovieDialog();
        if (openedMovie) {
            let data = [...this.dataset];
            this.dataset = [];
            data.unshift(openedMovie);
            this.dataset = data;
            (this.hot as any).__hotInstance.render();
        }
    }

    /**
     * @brief Opens form to edit a movie
     *
     * @param  {number} row : Row of the movie in the table
     * @returns Promise : Returns nothing
     */
    async openMovie(row: number): Promise<void> {
        console.log('************* openMovie *************');
        try {
            let movie: Movie = this.dataset[row];
            if (movie) {
                const openedMovie = await this._utilsService.openMovieDialog(movie.id!.toString());
                if (openedMovie) {
                    const needsUpdate = !this.isDeepEqual(openedMovie, movie);
                    if (needsUpdate) {
                        this.dataset[row] = openedMovie;
                        (this.hot as any).__hotInstance.render();
                    }
                }
            }
        } catch (err) {
            console.log('************* err *************');
            console.error(err);
            this._utilsService.openSnackBar('Failed loading movie', 'error');
        }
    }

    /**
     * @brief Checks the equality of two objects
     *
     * @param  {any} value1 : The first object to compare
     * @param  {any} value2 : The second object to compare
     * @returns boolean : true if the first object is equal to the second object
     */
    isDeepEqual(value1: any, value2: any): boolean {
        const keys1 = Object.keys(value1);
        const keys2 = Object.keys(value2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        for (let key of keys1) {
            if (value1[key] !== value2[key]) {
                return false;
            }
        }
        return true;
    }

    /**
     * @brief Shows or hides a loading spinner
     *
     * @param  {boolean} state : Current state to set
     * @returns void
     */
    showLoading(state: boolean): void {
        this.loading = state;
        if (state) {
            this.spinner.show('moviesSpinner', {
                type: this._utilsService.getRandomNgxSpinnerType(),
            });
        } else {
            this.spinner.hide('moviesSpinner');
        }
    }

    /**
     * @brief This function receives the option selected on the menu
     *
     * @param  {string} option : The current option selected
     * @returns Promise : Returns nothing
     */
    async onMenuOptionSelected(option: string): Promise<void> {
        if (option === 'Open') {
            await this.openSelectedMovie();
        } else if (option === 'Delete') {
            await this.deleteMovies();
        }
    }

    /**
     * @brief This function opens the last selected movie
     * It is trigger on the edit button click
     * @returns Promise : Returns nothing
     */
    async openSelectedMovie(): Promise<void> {
        if (this.selectedData) {
            await this.openMovie(this.selectedData.row);
            this.selectedData = undefined;
        }
    }

    /**
     * @brief This function deletes selected movies
     *
     * @returns Promise : Returns nothing
     */
    async deleteMovies(): Promise<void> {
        if (
            await this._utilsService.openQuestionDialog(
                'Confirmation',
                'Do you wish to delete the movies?'
            )
        ) {
            this.showLoading(true);
            if (this.selectedData.row2 != this.selectedData.row) {
                let ids: any[] = [];
                for (let i = this.selectedData.row; i <= this.selectedData.row2; i++) {
                    let movie: Movie = this.dataset[i];
                    if (movie) {
                        ids.push(movie.id!.toString());
                    }
                }
                for (let j = 0; j < ids.length; j++) {
                    const res = await this.movieService.deleteMovie(ids[j]);
                    let data = [...this.dataset];
                    this.dataset = [];
                    if (res) {
                        const index = data.indexOf(data.find((e) => e.id === ids[j]));
                        data.splice(index, 1);
                    }
                    this.dataset = data;
                    (this.hot as any).__hotInstance.render();
                }
            } else {
                let movie: Movie = this.dataset[this.selectedData.row];
                if (movie) {
                    const res = await this.movieService.deleteMovie(movie.id!.toString());
                    if (res) {
                        this._utilsService.openSnackBar('Movie deleted successfully');
                        let data = [...this.dataset];
                        this.dataset = [];
                        data.splice(this.selectedData.row, 1);
                        this.dataset = data;
                        (this.hot as any).__hotInstance.render();
                    } else {
                        this._utilsService.openSnackBar('Failed deleting movie');
                    }
                }
            }
            this.showLoading(false);
        }
        this.selectedData = undefined;
    }

    /**
     * @brief This function opens the menu on right click
     *
     * @param  {MouseEvent} event: Right click mouse event
     * @returns void
     */
    onRightClick(event: MouseEvent): void {
        // preventDefault avoids to show the visualization of the right-click menu of the browser
        event.preventDefault();
        // we record the mouse position in our object
        this.menuTopLeftPosition.x = event.clientX + 'px';
        this.menuTopLeftPosition.y = event.clientY + 'px';

        if (this.matMenuTrigger) {
            // we open the menu
            // we pass to the menu the information about our object
            // this.matMenuTrigger.menuData = { item: item };

            // we open the menu
            this.matMenuTrigger.openMenu();
        }
    }

    /**
     * @brief This function receives the page event of the table
     * Goes to the previous or the next page of the movies
     * @param  {any} event: The page event of the table
     */
    async pageEvent(event: any) {
        this.selectedData = undefined;
        if (this.lastPageIndex != event.pageIndex) {
            this.showLoading(true);
            try {
                this.dataset = [];
                this.dataset = await this.movieService.getMovies(event.pageIndex + 1);
                (this.hot as any).__hotInstance.render();
            } catch (error) {
                console.log('******************** error ********************');
                console.error(error);
                this._utilsService.openSnackBar('Failed loading data', 'error');
            }
            this.lastPageIndex = event.pageIndex;
            this.showLoading(false);
        }
    }
}
