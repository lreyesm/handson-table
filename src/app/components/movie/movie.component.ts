import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { Movie } from 'src/app/interfaces/movie';
import { MovieService } from 'src/app/services/movie.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
    selector: 'app-movie',
    templateUrl: './movie.component.html',
    styleUrls: ['./movie.component.scss'],
})
export class MovieComponent implements OnInit {
    loading: boolean = false;
    movieId: string = '';
    movie?: Movie;

    movieFormData: FormGroup;

    movieSubscription$?: Subscription;

    /**
     * @brief Form controls are loaded on the constructor
     *  The movie ID injected is set on the constructor
     * @param  {any} data : Data injected to the constructor
     * @param  {UtilsService} _utilsService : Utility service
     * @param  {MovieService} _movieService : Service for the movie requests
     * @param  {NgxSpinnerService} spinner : Service for the loading animation spinner
     */
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _utilsService: UtilsService,
        private _movieService: MovieService,
        public spinner: NgxSpinnerService
    ) {
        this.movieFormData = this.getMovieFormControls();
        if (data.movieId) {
            this.movieId = data.movieId;
        }
    }

    /**
     * @brief Requests the data of the movie and fills the form
     *
     * @returns Promise: Returns nothing
     */
    async ngOnInit(): Promise<void> {
        this.showLoading(true);
        if (this.movieId) {
            try {
                console.log('************* ngOnInit *************');
                const movie = await this._movieService.getMovie(this.movieId);
                this.movie = movie;
                const movieFormData = this.getMovieFormControls();

                const keys = Object.keys(movie);
                for (let key of keys) {
                    let value: any = movie[key as keyof Movie];
                    if (value) {
                        movieFormData.controls[key].setValue(value);
                    }
                }
                this.movieFormData = movieFormData;
            } catch (err) {
                console.log('************* err *************');
                console.log(err);
                this._utilsService.openSnackBar('Failed loading movie data', 'error');
            }
        }
        this.showLoading(false);
    }

    /**
     * @brief Returns the form group controls of the form
     *
     * @returns FormGroup: The form group of the form
     */
    getMovieFormControls(): FormGroup {
        return new FormGroup({
            id: new FormControl(),
            budget: new FormControl(),
            originalLang: new FormControl(),
            originalTitle: new FormControl(),
            overview: new FormControl(),
            popularity: new FormControl(),
            releaseDate: new FormControl(),
            revenue: new FormControl(),
            runtime: new FormControl(),
            status: new FormControl(),
            tagline: new FormControl(),
            title: new FormControl(),
            voteAverage: new FormControl(),
            voteCount: new FormControl(),
            createdAt: new FormControl(),
            updatedAt: new FormControl(),
            deletedAt: new FormControl(),
        });
    }

    /**
     * @brief Save the form data of the movie and set it to a movie property
     *
     * @returns void
     */
    saveFormData(): void {
        const keys = Object.keys(this.movieFormData.controls);
        let movie: any = {};
        for (let key of keys) {
            let value = this.movieFormData.controls[key].value; //this.movie[key as keyof Movie];
            try {
                if (moment.isMoment(value)) {
                    value = value.toDate().toISOString();
                }
                movie![key as keyof Movie] = value;
            } catch (error) {}
        }
        this.movie = movie;
    }

    /**
     * @brief Saves and updates the movie on the server
     *
     * @returns Promise
     */
    async saveChanges(): Promise<void> {
        this.showLoading(true);
        this.saveFormData();
        try {
            if (this.movieId) {
                const res = await this._movieService.updateMovie(
                    this.movie!,
                    this.movie!.id!.toString()
                );
                if (res) {
                    this._utilsService.openSnackBar('Movie updated successfully');
                    this._utilsService.closeMovieDialog(this.movie);
                } else {
                    this._utilsService.openSnackBar('Failed updating movie', 'error');
                }
            } else {
                const movie = await this._movieService.addMovie(this.movie!);
                this.movie = movie;
                console.log('************* movie *************');
                console.log(movie);
                if (movie) {
                    this._utilsService.openSnackBar('Movie created successfully');
                    this._utilsService.closeMovieDialog(movie);
                } else {
                    this._utilsService.openSnackBar('Failed creating movie', 'error');
                }
            }
        } catch (err) {
            console.log('************* err *************');
            console.log(err);
            this._utilsService.openSnackBar('Failed updating data', 'error');
        }
        this.showLoading(false);
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
            this.spinner.show('movieSpinner', {
                type: this._utilsService.getRandomNgxSpinnerType(),
            });
        } else {
            this.spinner.hide('movieSpinner');
        }
    }
}
