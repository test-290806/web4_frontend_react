import {useState} from "react";
import PropTypes from "prop-types";
import NumberInput from "../../Input/NumberInput.jsx";
import styles from "./PointForm.module.css";
import {useDispatch, useSelector} from "react-redux";
import {setRadius} from "../../../redux/RadiusSlice.js";

function PointForm({pointChecker}) {
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    const radius = useSelector((state) => state.radiusReducer.radius);
    const dispatch = useDispatch();

    function handleRadiusChange(value) {
        dispatch(setRadius(Number(value)));
    }

    function submitForm(event) {
        event.preventDefault();
        pointChecker(x, y, radius);
    }

    return (
        <form onSubmit={submitForm} className={styles["form"]}>
            <div className={styles["input-container"]}>
                <label htmlFor="x">
                    X:
                </label>
                <NumberInput
                    value={x}
                    onChange={setX}
                    id="x"
                    placeholder="Введите X"
                    min="-3"
                    max="3"
                    step="1"
                />
            </div>
            <div className={styles["input-container"]}>
                <label htmlFor="y">
                    Y:
                </label>
                <NumberInput
                    value={y}
                    onChange={setY}
                    id="y"
                    placeholder="Введите Y"
                    min="-3"
                    max="3"
                    step="1"
                />
            </div>
            <div className={styles["input-container"]}>
                <label htmlFor="r">
                    R:
                </label>
                <NumberInput
                    value={radius}
                    onChange={handleRadiusChange}
                    id="r"
                    placeholder="Введите R"
                    min="1"
                    max="5"
                    step="1"
                />
            </div>
            <button className="button"
                    type="submit">
                Проверить
            </button>
        </form>
    );
}

PointForm.propTypes = {
    pointChecker: PropTypes.func,
    radius: PropTypes.number,
    radiusChangeHandler: PropTypes.func
}

export default PointForm;
