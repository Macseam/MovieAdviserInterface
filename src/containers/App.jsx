import React, { Component } from "react";
import ReactDOM from "react-dom";
import axios from 'axios';
import 'antd/dist/antd.css';
import _ from 'lodash';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import { Button, Card, Col, Empty, Icon, message, Rate, Row, Spin, Tag } from "antd";

const NODE_ENV = process.env.NODE_ENV || 'production';
const apiUrl = NODE_ENV === 'production' ? 'http://macseam.ru:8080' : 'http://localhost:3000';
const genresDictionary = {
    'Crime': 'Криминальный',
    'Thriller': 'Триллер',
    'Comedy': 'Комедия',
    'Drama': 'Драма',
    'History': 'Исторический',
    'Romance': 'Романтический',
    'Family': 'Семейный',
    'Horror': 'Ужасы',
    'Documentary': 'Документальный',
    'Adventure': 'Приключенческий',
    'Mystery': 'Мистика',
    'Short': 'Короткометражный',
    'Action': 'Экшен',
    'War': 'Военный',
    'Animation': 'Анимация',
    'Biography': 'Биография',
    'Music': 'Музыкальный',
    'Musical': 'Мюзикл',
    'Fantasy': 'Фэнтези',
    'Sci-Fi': 'Фантастика',
    'Reality-TV': 'Реалити-шоу',
    'Sport': 'Спортивный',
    'Western': 'Вестерн',
}
const yearsDictionary = {'old': 'Старые', 'new': 'Новые', 'all': 'Любые'}
const ratingsDictionary = {'low': 'Низкий рейтинг', 'high': 'Высокий рейтинг', 'all': 'Любые'}

momentDurationFormatSetup(moment)

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            movies: [],
            loading: false,
            genre: _.noop(),
            rating: _.noop(),
            year: _.noop(),
        };
    }

    chooseQueryParam = e => {
        const value = e.target.name.split('-')
        this.setState({
            [value[0]]: value[1]
        }, () => {
            if (value[0] === 'rating') {
                this.showAnother()
            }
        })
    }

    showAnother = () => {
        const { genre, rating, year } = this.state;
        const that = this
        that.setState({
            movies: [],
            loading: true,
        });
        const startTime = moment()
        axios.get(`${apiUrl}/random?genre=${genre}&year=${year}&rating=${rating}`)
            .then(function (response) {
                const timeSpent = moment().diff(startTime)
                message.info(`Время выполнения запроса: ${moment.utc(timeSpent).format('ss:SS')}`);
                that.setState({
                    movies: response.data,
                    loading: false,
                });
            })
            .catch(function (err) {
                const errorText = _.get(err, 'response.data.error', null)
                const errorStatus = _.get(err, 'response.status', null)
                let errorMsg = 'Неизвестная ошибка'
                if (errorText) {
                    errorMsg = errorText
                } else if (errorStatus) {
                    errorMsg = `Ошибка ${errorStatus}`
                } else if (err.request) {
                    errorMsg = 'Ошибка получения данных от сервера'
                }
                message.error(errorMsg);
                that.setState({
                    movies: [],
                    loading: false,
                });
            })
    }

    flagAsLoaded = id => {
        const { movies } = this.state
        const moviesMutated = movies
        const movieIndex = _.findIndex(movies, movieItem => movieItem.tconst === id)
        moviesMutated[movieIndex].loaded = true
        this.setState({
            movies: moviesMutated
        })
    }

    resetQuery = () => {
        this.setState({
            movies: [],
            loading: false,
            genre: _.noop(),
            rating: _.noop(),
            year: _.noop(),
        })
    }

    render() {
        const { movies, loading, genre, year, rating } = this.state;

        if (!genre) {
            return (
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    {_.map(genresDictionary, (dictItem, index) => (
                        <Button
                            key={index}
                            htmlType='button'
                            name={`genre-${index}`}
                            onClick={this.chooseQueryParam}
                            style={{ margin: '4px' }}
                        >
                            {dictItem}
                        </Button>
                    ))}
                </div>
            )
        }

        if (genre && !year) {
            return (
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    {_.map(yearsDictionary, (dictItem, index) => (
                        <Button
                            key={index}
                            htmlType='button'
                            name={`year-${index}`}
                            onClick={this.chooseQueryParam}
                            style={{ margin: '4px' }}
                        >
                            {dictItem}
                        </Button>
                    ))}
                </div>
            )
        }

        if (year && !rating) {
            return (
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    {_.map(ratingsDictionary, (dictItem, index) => (
                        <Button
                            key={index}
                            htmlType='button'
                            name={`rating-${index}`}
                            onClick={this.chooseQueryParam}
                            style={{ margin: '4px' }}
                        >
                            {dictItem}
                        </Button>
                    ))}
                </div>
            )
        }

        return (
            <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                <Row gutter={24} style={{ margin: '0' }}>
                    {loading &&
                        <Col span={24}>
                            <div style={{
                                textAlign: 'center',
                                height: '200px',
                                paddingTop: '100px'
                            }}>
                                <Spin tip="Загрузка списка фильмов" />
                            </div>
                        </Col>
                    }

                    {!loading && _.isEmpty(movies) &&
                    <Empty
                        description='Не удалось получить список фильмов'
                    >
                        <Button
                            htmlType="button"
                            onClick={() => this.resetQuery()}
                        >
                            Попробовать ещё раз
                        </Button>
                    </Empty>
                    }

                    {!_.isEmpty(movies) && _.map(movies, (movieItem, index) => {
                        const durationString = moment.duration(parseInt(movieItem.runtime_minutes, 10), "minutes")
                        const durationHours = durationString._data.hours
                        const durationMinutes = durationString._data.minutes
                        return (
                            <Col key={movieItem.tconst} span={6} offset={index === 0 ? 3 : 0}>
                                <Card
                                    title={<div>
                                        <h3>{movieItem.primary_title}</h3>
                                        <h5>{movieItem.title}</h5>
                                    </div>}
                                >
                                    <h5>Год выхода: {movieItem.start_year}</h5>
                                    <h5>Сколько идёт: {durationHours ? `${durationHours} ч ` : ''}{durationMinutes ? `${durationMinutes} мин` : ''}</h5>
                                    <Rate
                                        style={{ margin: '10px 0' }}
                                        disabled
                                        defaultValue={movieItem.average_rating
                                            ? parseInt(movieItem.average_rating / 2, 10)
                                            : movieItem.average_rating}
                                        allowHalf
                                    /> {movieItem.average_rating}
                                    <div style={{
                                        width: '100%',
                                        height: !movieItem.loaded ? '400px' : _.noop(),
                                        background: !movieItem.loaded ? '#e8e8e8' : _.noop(),
                                        paddingTop: !movieItem.loaded ? '180px' : _.noop(),
                                        textAlign: 'center',
                                        marginBottom: '8px',
                                    }}>
                                        {!movieItem.loaded &&
                                        <Icon
                                            type="loading"
                                            style={{
                                                fontSize: '24px',
                                                display: 'inline-block',
                                                verticalAlign: 'middle'
                                            }}
                                        />
                                        }
                                        <img
                                            src={`${apiUrl}/cover?movie_id=${movieItem.tconst}`}
                                            style={{ maxWidth: '100%', display: movieItem.loaded ? 'block' : 'none'}}
                                            onLoad={() => this.flagAsLoaded(movieItem.tconst)}
                                        />
                                    </div>
                                    {!_.isEmpty(movieItem.genres) && _.map(movieItem.genres.split(','), (genreItem, indexGenre) => (
                                        <Tag key={indexGenre}>{genresDictionary[genreItem] || genreItem}</Tag>
                                    ))
                                    }
                                </Card>
                            </Col>
                        )
                    }
                    )}
                </Row>
                {!_.isEmpty(movies) &&
                    <div style={{ textAlign: 'center', width: '100%', marginTop: '30px' }}>
                        <Button
                            htmlType="button"
                            onClick={() => this.showAnother()}
                            style={{ margin: '4px' }}
                        >
                            Обновить список
                        </Button>
                        <Button
                            htmlType="button"
                            onClick={() => this.resetQuery()}
                            style={{ margin: '4px' }}
                        >
                            Начать сначала
                        </Button>
                    </div>
                }
            </div>
        );
    }
}
export default App;

ReactDOM.render(<App />, document.getElementById("root"))