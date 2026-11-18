#  at this point we have already confirmed there is no parse
#  error but we don't have the parsed program, so we run it
#  again (a future version could reuse the check result here).
#  we can't use the existing `run_program` because it uses threads.
#  a program has no evaluation result except from the exit code
#  and the collection of print outputs which we have captured

import pathlib
import time

from purepy.check_program import Diagnostic, exit_code, format_diagnostic
from purepy.run_program import check, evaluate


def run(path: str) -> dict[str, int]:
    entry_path = pathlib.Path(path)
    match check(entry_path):
        case Diagnostic() as d:
            print(format_diagnostic(d, entry_path))
            return {"status": int(exit_code(d)), "elapsed": 0}
        case (M, sigma):
            pass

    start = time.perf_counter_ns()
    status = evaluate(sigma, M, [str(entry_path)], 100_000)
    end = time.perf_counter_ns()
    elapsed = (end - start) // 1_000_000  # milliseconds
    return {"status": status, "elapsed": elapsed}
