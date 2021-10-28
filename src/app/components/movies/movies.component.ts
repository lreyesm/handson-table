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
    // providers: [
    //     { provide: MatPaginatorIntl, useValue: CustomPaginator() }, // Here
    // ],
})
export class MoviesComponent implements OnInit {
    @ViewChild('handson') hot?: Handsontable;
    @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger?: MatMenuTrigger;

    length = 0; //movie count in current table
    pageSize = 100; //limit of query
    // pageSize = 500; //limit of query
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
    manualColumnMove: any = true;

    menuTopLeftPosition = { x: '0', y: '0' };

    menuOptions = ['Open', 'Delete'];

    dropIndex: any;
    table?: Handsontable;

    id: string = 'localhost';

    action: string = 'recargar';

    selectedData: any;

    loading = true;
    // contextMenuInfo : string [] = ['row_above', 'row_below', 'remove_row'];
    //contextMenuInfo: any = true

    innerHeight: any = 1080;
    customHeight: any = '1080px';

    constructor(
        private movieService: MovieService,
        //private hotRegisterer: HotTableRegisterer,
        private _snackBar: MatSnackBar,
        private _utilsService: UtilsService,
        private spinner: NgxSpinnerService
    ) {
        this.loadSavedColumnOrder();
    }

    async ngOnInit(): Promise<void> {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.

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
        this.showLoading(false);

        this.addHooks();
        // (<any>window).MyPropertyName = this.hot;
        // (<any>window).MyPropertyFunction = this.openMovie;
        // (<any>window).MyPropertyService = this._utilsService;
        // this.contextMenuInfo = {
        //   callback(key: any, selection: any, clickEvent: any) {
        //     // Common callback for all options
        //   },
        //   items: {
        //     update_movie: {
        //       name(): void {
        //         return '<h4>Update</h4>' // Name can contain HTML
        //       },

        //         callback(): void {
        //             const selected = (<any>(
        //               window
        //             )).MyPropertyName.__hotInstance.getSelectedLast()
        //             ;(<any>window).MyPropertyFunction(selected[0])

        //       },
        //     },
        //     sp1: '---------',

        //     delete_movie: {
        //       // Own custom option
        //       name(): void {
        //         return '<b>Delete</b>' // Name can contain HTML
        //       },

        //         callback(): void {
        //             const selected = (<any>(
        //               window
        //             )).MyPropertyName.__hotInstance.getSelectedLast()
        //             ;(<any>window).MyPropertyFunction(selected[0])

        //       },

        //     },

        //   },
        // }
    }

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

    addHooks() {
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
                                await this.movieService.updateMovie(movie, movie.id!.toString());
                            }
                        }
                    }
                }
            }
        });
    }
    loadSavedColumnOrder(): void {
        let saveManualColumnMove = localStorage.getItem('localhost_manualColumnMove');
        if (saveManualColumnMove) {
            saveManualColumnMove = saveManualColumnMove.replace('[', '');
            saveManualColumnMove = saveManualColumnMove.replace(']', '');
            const tempArray = saveManualColumnMove.split(',');
            try {
                const intArray = tempArray.map((e) => parseInt(e));
                this.manualColumnMove = intArray;
            } catch (err) {
                this._utilsService.openSnackBar('Failed loading column order', 'error');
            }
        }
    }

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

    async onMenuOptionSelected(option: string): Promise<void> {
        if (option === 'Open') {
            await this.openSelectedMovie();
        } else if (option === 'Delete') {
            await this.deleteMovies();
        }
    }

    async openSelectedMovie() {
        if (this.selectedData) {
            await this.openMovie(this.selectedData.row);
            this.selectedData = undefined;
        }
    }
    async deleteMovies() {
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

    async pageEvent(event: any) {
        console.log(`length ${event.length}`);
        console.log(`pageSize ${event.pageSize}`);
        console.log(`pageIndex ${event.pageIndex}`);
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
