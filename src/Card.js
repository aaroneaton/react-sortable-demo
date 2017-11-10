import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import { Motion, spring } from 'react-motion';

const style = {
    border: '1px solid #ccc',
    padding: '0.5rem 1rem',
    marginBottom: '.5rem',
    backgroundColor: 'white',
    cursor: 'move'
};

const clamp = (n, min, max) => {
    return Math.max(Math.min(n, max), min);
};

const reinsert = (arr, from, to) => {
    const _arr = arr.slice(0);
    const val = _arr[from];
    _arr.splice(from, 1);
    _arr.splice(to, 0, val);
    return _arr;
};

const springConfig = { stiffness: 90, damping: 13 };

const cardDragSource = {
    beginDrag(props) {
        return {
            id: props.id,
            originalIndex: props.findCard(props.id).index
        }
    },
    endDrag(props, monitor) {
        const { id: droppedId, originalIndex } = monitor.getItem();
        const didDrop = monitor.didDrop();

        if (!didDrop) {
            props.moveCard(droppedId, originalIndex);
        }
    }
};

const cardDragCollect = (connect, monitor) => (
    {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
);

const cardDropTarget = {
    canDrop() {
        return false;
    },
    hover(props, monitor) {
        const { id: draggedId } = monitor.getItem();
        const { id: overId } = props;

        if (draggedId !== overId) {
            const { index: overIndex } = props.findCard(overId);
            props.moveCard(draggedId, overIndex);
        }
    }
};

const cardDropCollect = (connect) => (
    {
        connectDropTarget: connect.dropTarget()
    }
);

class Card extends Component {
    static propTypes = {
        connectDragSource: PropTypes.func.isRequired,
        connectDropTarget: PropTypes.func.isRequired,
        isDragging: PropTypes.bool.isRequired,
        id: PropTypes.any.isRequired,
        text: PropTypes.string.isRequired,
        moveCard: PropTypes.func.isRequired,
        findCard: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            topDeltaY: 0,
            mouseY: 0,
            isPressed: false,
            originalPosOfLastPressed: 0,
            order: props.order
        }
    }

    componentDidMount() {
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    handleMouseDown = (pos, pressY, { pageY }) => {
        this.setState({
            topDeltaY: pageY - pressY,
            mouseY: pressY,
            isPressed: true,
            originalPosOfLastPressed: pos
        });
    };

    handleMouseMove = ({ pageY }) => {
        const { isPressed, topDeltaY, order, originalPosOfLastPressed } = this.state;

        if (isPressed) {
            const mouseY = pageY - topDeltaY;
            const currentRow = clamp(Math.round(mouseY / 100), 0, this.props.order.length - 1);
            let newOrder = order;
            if (currentRow !== order.indexOf(originalPosOfLastPressed)) {
                newOrder = reinsert(order, order.indexOf(originalPosOfLastPressed), currentRow);
            }

            this.setState({ mouseY: mouseY, order: newOrder });
        }
    };

    handleMouseUp = () => {
        this.setState({ isPressed: false, topDeltaY: 0 });
    };

    render() {
        const {
            index,
            text,
            isDragging,
            connectDragSource,
            connectDropTarget,
        } = this.props
        const {
            mouseY,
            isPressed,
            originalPosOfLastPressed,
            order
        } = this.state;
        const opacity = isDragging ? 0 : 1

        const motionStyles = originalPosOfLastPressed === index && isPressed
            ? {
                scale: spring(1.1, springConfig),
                shadow: spring(16, springConfig),
                y: mouseY
            }
            : {
                scale: spring(1, springConfig),
                shadow: spring(1, springConfig),
                y: spring(order.indexOf(index) * 10, springConfig)
            };

        return connectDragSource(
            connectDropTarget(
                <div>
                    <Motion style={motionStyles}>
                        {({ scale, shadow, y }) => (
                            <div
                                onMouseDown={this.handleMouseDown.bind(null, index, y)}
                                style={{
                                    ...style,
                                    opacity,
                                    boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${2 * shadow}px 0px`,
                                    transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                                    WebkitTransform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                                    zIndex: index === originalPosOfLastPressed ? 99 : index,
                                }}
                            >
                                {text}
                            </div>
                        )}
                    </Motion>
                </div>
            ),
        )
    }
}

export default DropTarget('card', cardDropTarget, cardDropCollect)(DragSource('card', cardDragSource, cardDragCollect)(Card));