import {forwardRef, Fragment, useEffect, useImperativeHandle, useRef, useState} from "react";
import styles from "./Graph.module.css";
import PropTypes from "prop-types";
import {useSelector} from "react-redux";

const Graph = forwardRef(({pointChecker}, ref) => {
    const svgRef = useRef(null);
    const isDataLoaded = useRef(false);
    const radius = useSelector((state) => state.radiusReducer.radius);
    const history = useSelector((state) => state.historyReducer.history);

    function handleRChange() {
        setRSerif(() => radius ? radius : "R");
        setRDiv2Serif(() => radius ? radius / 2 : "R/2");
        redrawPoints();
    }

    //TODO: remove hardcode
    const length = 350;

    useEffect(handleRChange, [radius]);

    const [RSerif, setRSerif] = useState("R");
    const [RDiv2Serif, setRDiv2Serif] = useState("R/2");

    const half = length / 2;
    const seg = half / 3;
    const mcr = seg / 10;
    const tick = mcr / 2;

    const axisData = [{x1: -half, y1: 0, x2: half, y2: 0}, {x1: 0, y1: half, x2: 0, y2: -half}];
    const arrowData = [{x: half, y: 0, dx: -2 * mcr, dy: mcr, c: -1}, {x: 0, y: -half, dx: mcr, dy: 2 * mcr, c: 1}];
    const serifData = [-2 * seg, -seg, seg, 2 * seg];
    const labelData = [{c: 'X', dx: 0, dy: 4 * mcr, cx: 1, cy: 0}, {c: 'Y', dx: mcr, dy: mcr, cx: 0, cy: 1}];
    const labelValues = ['-' + RSerif, '-' + RDiv2Serif, RDiv2Serif, RSerif];

    function handleGraphClick(event) {
        const plane = svgRef.current;

        let point = plane.createSVGPoint();

        point.x = event.clientX;
        point.y = event.clientY;

        point = point.matrixTransform(plane.getScreenCTM().inverse());

        const scale = radius / (2 * seg);

        point.x *= scale;
        point.y *= -scale;
        pointChecker(point.x, point.y, radius);
    }

    function drawPoint(x, y, hit) {
        const svg = svgRef.current;
        if (hit !== null && svg) {
            const scale = radius / (2 * seg);

            let graphX = x / scale;
            let graphY = y / -scale;

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", graphX);
            circle.setAttribute("cy", graphY);
            circle.setAttribute("class", styles["point"]);
            circle.setAttribute("fill", hit ? "green" : "red");
            svg.querySelector("#points").appendChild(circle);
        }
    }

    function removeAllPoints() {
        const points = svgRef.current.querySelectorAll("circle");
        points.forEach(point => point.remove());
    }

    function redrawPoints() {
        removeAllPoints();
        history.forEach((point) => {
            drawPoint(point.x, point.y, point.hit);
        });
    }

    useEffect(() => {
        if (isDataLoaded.current) redrawPoints();
    }, [isDataLoaded]);

    useImperativeHandle(ref, () => ({drawPoint}));

    return (
        <div className={styles["graph-container"]}>
            <svg
                className={styles["graph"]}
                ref={svgRef}
                viewBox={`${-half} ${-half} ${length} ${length}`}
                xmlns="http://www.w3.org/2000/svg"
                onClick={handleGraphClick}
            >
                <g id="graph">
                    <path
                        d={`M 0 0 0 ${-2 * seg} A ${2 * seg} ${2 * seg} 0 0 1 ${2 * seg} 0 L ${seg} 0 ${seg} ${2 * seg} 0 ${2 * seg} 0 0 ${-seg} 0 0 ${-2 * seg} Z`}
                        className={styles["figure"]}/>
                </g>
                <g id="axis">
                    {axisData.map(({x1, y1, x2, y2}, i) => (
                        <line key={`axis-${i}`}
                              x1={x1} y1={y1}
                              x2={x2} y2={y2}
                              className={styles["axis"]}/>

                    ))}

                    {arrowData.map(({x, y, dx, dy, c}, i) => (
                        <path key={`arrow-${i}`}
                              d={`M ${x + dx} ${y + dy} L ${x} ${y} L ${x - c * dx} ${y + c * dy}`}
                              className={styles["arrow"]}/>

                    ))}

                    {serifData.map((c, i) =>
                        [[c, tick, 1], [tick, c, -1]].map(([x, y, cnt], j) => (
                            <line key={`serif-${i}-${j}`}
                                  x1={x} y1={y}
                                  x2={cnt * x} y2={-cnt * y}
                                  className={styles["axis"]}/>

                        ))
                    )}
                </g>
                <g id="points"/>
                <g id="labels">
                    {labelData.map(({c, dx, dy, cx, cy}, i) => (
                        <Fragment key={`label-container-${i}`}>
                            <text key={`label-${i}`}
                                  x={cx * half - 2 * dx}
                                  y={dy - cy * (half - dy)}
                                  textAnchor="end"
                                  className={styles["label"]}>{c}</text>
                            {labelValues.map((val, j) => (
                                <text key={`label-${i}-${j}`}
                                      x={cx * serifData[j] - dx}
                                      y={dy - cy * serifData[j]}
                                      textAnchor={cx ? "middle" : "end"}
                                      className={styles["label"]}>{val}</text>
                            ))}
                        </Fragment>
                    ))}
                </g>
            </svg>
        </div>
    );
});

Graph.propTypes = {
    pointChecker: PropTypes.func,
    radius: PropTypes.number,
    history: PropTypes.array
}

Graph.displayName = "Graph";

export default Graph;
