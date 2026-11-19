import pathlib
import time

from purepy.check_program import check_program, error_path


def check(path: str):
    entry_path = pathlib.Path(path)

    start = time.perf_counter_ns()
    diagnostic = check_program(entry_path)
    end = time.perf_counter_ns()
    elapsed = (end - start) // 1_000_000  # milliseconds

    error = (
        None
        if diagnostic is None
        else {
            "diagnostic": diagnostic,
            "file": str(error_path(diagnostic, entry_path)),
        }
    )

    return {"error": error, "elapsed": elapsed}
