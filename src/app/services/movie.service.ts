import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Movie } from '../interfaces/movie';

@Injectable({
    providedIn: 'root',
})
export class MovieService {
    url: string = `http://test-movies-api.vercel.app`;
    // url: string = `http://45.93.100.189:3000`;
    // url: string = `http://localhost:3000`;

    constructor(private http: HttpClient) {}

    /**
     * @param  {number=1} page: Number of the pagination to display
     * @returns Promise: Returns a promise that resolves with an array of movies
     */
    async getMovies(page: number = 1): Promise<Movie[]> {
        return new Promise<Movie[]>((resolve, reject) => {
            try {
                const headers = {
                    page: `${page}`,
                };
                const requestOptions = {
                    headers: new HttpHeaders(headers),
                    params: { page: `${page}` },
                };
                console.log('************* getMovies *************');
                const subscription = this.http
                    .get(`${this.url}/api/movies`, requestOptions)
                    .subscribe(
                        (data: any) => {
                            try {
                                resolve(data);
                            } catch (err) {
                                reject(err);
                            }
                            subscription.unsubscribe();
                        },
                        (error) => reject(error)
                    );
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * @param  {Movie} movie: Movie object to add to the database
     * @returns Promise: Promise resolved with the movie uploaded
     */
    async addMovie(movie: Movie): Promise<Movie> {
        return new Promise<Movie>((resolve, reject) => {
            const postParams = movie;
            console.log('************* addMovie *************');
            const subscription = this.http.post(`${this.url}/api/movies`, postParams).subscribe(
                (data) => {
                    try {
                        if (this.isDeepEqual(movie, data, ['id'])) {
                            resolve(data);
                        } else {
                            resolve({});
                        }
                    } catch (err) {
                        console.error(err);
                        reject(err);
                    }
                    subscription.unsubscribe();
                },
                (error) => reject(error)
            );
        });
    }

    /**
     * @param  {string} movieId:: The movie ID to get from the server
     * @returns Promise: Promise resolved with the movie obtained
     */
    async getMovie(movieId: string): Promise<Movie> {
        return new Promise<Movie>((resolve, reject) => {
            console.log('************* getMovie *************');
            console.log(`${this.url}/api/movies/${movieId}`);
            const subscription = this.http.get(`${this.url}/api/movies/${movieId}`).subscribe(
                (data: any) => {
                    try {
                        // console.log('************* data *************');
                        // console.log(data);
                        resolve(data);
                    } catch (err) {
                        console.error(err);
                        reject(err);
                    }
                    subscription.unsubscribe();
                },
                (error) => reject(error)
            );
        });
    }

    /**
     * @param  {Movie} movie : The movie data to update
     * @param  {string} movieId : The movie ID to update from the server
     * @returns Promise: Promise resolved with a boolean representing the updating correctness
     */
    async updateMovie(movie: Movie, movieId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const postParams = movie;
            console.log('************* getMovie *************');
            const subscription = this.http
                .put(`${this.url}/api/movies/${movieId}`, postParams)
                .subscribe(
                    (data) => {
                        try {
                            if (this.isDeepEqual(movie, data)) {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        } catch (err) {
                            console.error(err);
                            reject(err);
                        }
                        subscription.unsubscribe();
                    },
                    (error) => reject(error)
                );
        });
    }

    /**
     * @param  {string} movieId:  The movie ID to delete from the server
     * @returns Promise: Promise resolved with a boolean representing the updating correctness
     */
    async deleteMovie(movieId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            console.log('************* deleteMovie *************');
            const subscription = this.http.delete(`${this.url}/api/movies/${movieId}`).subscribe(
                (data: any) => {
                    try {
                        if (data.message === 'Movie deleted!') {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    } catch (err) {
                        console.error(err);
                        reject(err);
                    }
                    subscription.unsubscribe();
                },
                (error) => reject(error)
            );
        });
    }

    /**
     * @param  {any} value1 : The first Object to compare
     * @param  {any} value2 : The second Object to compare
     * @param  {string[]} dismissFields?: Fields to dismiss on comparing
     * @returns boolean : true if the first object is equal to the second object
     */
    isDeepEqual(value1: any, value2: any, dismissFields?: string[]): boolean {
        const keys1 = Object.keys(value1);
        const keys2 = Object.keys(value2);
        if (dismissFields) {
            dismissFields = ['createdAt', 'updatedAt', 'deletedAt', ...dismissFields];
        } else {
            dismissFields = ['createdAt', 'updatedAt', 'deletedAt'];
        }
        for (let key of keys1) {
            if (value1[key] !== value2[key]) {
                if (dismissFields.includes(key)) {
                    continue;
                }
                return false;
            }
        }
        return true;
    }
}
