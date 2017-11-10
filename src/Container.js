import React, { Component } from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {range} from 'lodash';
import Card from './Card';

const style = {
    width: 400,
    margin: '0 auto'
};

const cardTarget = {
    drop() { },
};

const cardConnect = (connect, monitor) => (
    {
        connectDropTarget: connect.dropTarget()
    }
);

class Container extends Component {
    static propTypes = {
        connectDropTarget: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            cards: [
                {
                    id: 1,
                    text: 'Write a cool JS library',
                },
                {
                    id: 2,
                    text: 'Make it generic enough',
                },
                {
                    id: 3,
                    text: 'Write README',
                },
                {
                    id: 4,
                    text: 'Create some examples',
                },
                {
                    id: 5,
                    text: 'Spam in Twitter and IRC to promote it',
                },
                {
                    id: 6,
                    text: '???',
                },
                {
                    id: 7,
                    text: 'PROFIT',
                }
            ]
        }
    }

    moveCard = (id, atIndex) => {
        const { card, index } = this.findCard(id);
        this.setState(
            update(this.state, {
                cards: {
                    $splice: [[index, 1], [atIndex, 0, card]]
                }
            })
        );
    }

    findCard = (id) => {
        const { cards } = this.state;
        const card = cards.filter(c => c.id === id)[0];

        return {
            card,
            index: cards.indexOf(card)
        };
    }

    render() {
        const { connectDropTarget } = this.props;
        const { cards } = this.state;

        return connectDropTarget(
            <div className="container" style={style}>
                {cards.map((card, i) => (
                    <Card
                        key={card.id}
                        id={card.id}
                        index = {i}
                        text={card.text}
                        moveCard={this.moveCard}
                        findCard={this.findCard}
                        order={range(cards.length)}
                    />
                ))}
            </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(DropTarget('card', cardTarget, cardConnect)(Container));