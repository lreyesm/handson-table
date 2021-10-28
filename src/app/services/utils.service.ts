import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
    MatSnackBar,
    MatSnackBarHorizontalPosition,
    MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { Movie } from '../interfaces/movie';
import { QuestionDialogComponent } from '../components/question-dialog/question-dialog.component';
import { MovieComponent } from '../components/movie/movie.component';

@Injectable({
    providedIn: 'root',
})
export class UtilsService {
    movieDialogRef!: MatDialogRef<MovieComponent, any>;
    horizontalPosition: MatSnackBarHorizontalPosition = 'end';
    verticalPosition: MatSnackBarVerticalPosition = 'top';

    constructor(
        private _snackBar: MatSnackBar,
        public dialog: MatDialog,
        public questionDialog: MatDialog
    ) {}

    openSnackBar(
        text: string,
        type: string = 'info' /*info warning error */,
        durationInSeconds: number = 5000
    ) {
        this._snackBar.open(text, '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: durationInSeconds,
            panelClass: [`my-snack-bar-${type}`],
        });
    }

    openQuestionDialog(title: string, text: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            const dialogRef = this.questionDialog.open(QuestionDialogComponent, {
                data: {
                    title: title,
                    text: text,
                },
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }
    openMovieDialog(movieId?: string): Promise<Movie> {
        return new Promise<Movie>(async (resolve, reject) => {
            this.movieDialogRef = this.dialog.open(MovieComponent, {
                data: {
                    movieId: movieId,
                },
            });
            this.movieDialogRef.beforeClosed().subscribe((result) => {
                resolve(result);
            });
        });
    }
    closeMovieDialog(result: Movie | undefined) {
        this.movieDialogRef.close(result);
    }

    getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
    }
    getRandomNgxSpinnerType(): string {
        const spinnerTypeName =
            this.ngxSpinnerTypes[this.getRandomInt(this.ngxSpinnerTypes.length)];
        // console.log('************* spinnerTypeName *************');
        // console.log(spinnerTypeName);
        // console.log('************* spinnerTypeName *************');
        return spinnerTypeName;
    }

    ngxSpinnerTypes = [
        // "ball-8bits", //this is an ugly one
        'ball-atom',
        'ball-beat',
        'ball-circus',
        'ball-climbing-dot',
        'ball-clip-rotate',
        'ball-clip-rotate-multiple',
        'ball-clip-rotate-pulse',
        'ball-elastic-dots',
        'ball-fall',
        'ball-fussion',
        'ball-grid-beat',
        'ball-grid-pulse',
        'ball-newton-cradle',
        'ball-pulse',
        'ball-pulse-rise',
        'ball-pulse-sync',
        'ball-rotate',
        'ball-running-dots',
        'ball-scale',
        'ball-scale-multiple',
        'ball-scale-pulse',
        'ball-scale-ripple',
        'ball-scale-ripple-multiple',
        'ball-spin',
        'ball-spin-clockwise',
        'ball-spin-clockwise-fade',
        'ball-spin-clockwise-fade-rotating',
        'ball-spin-fade',
        'ball-spin-fade-rotating',
        'ball-spin-rotate',
        'ball-square-clockwise-spin',
        'ball-square-spin',
        'ball-zig-zag',
        'ball-triangle-path',
        'ball-zig-zag-deflect',
        'cube-transition',
        'fire',
        'line-scale',
        'line-scale-party',
        'line-scale-pulse-out',
        'line-scale-pulse-out-rapid',
        'line-spin-clockwise-fade',
        'line-spin-clockwise-fade-rotating',
        'line-spin-fade',
        'line-spin-fade-rotating',
        'pacman',
        'square-jelly-box',
        'square-loader',
        'square-spin',
        'timer',
        'triangle-skew-spin',
    ];
}
