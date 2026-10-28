"""Copie les inscrits du formulaire Tally « Molécules décodées » dans une liste Brevo."""
import json, os, sys, urllib.request, urllib.error
from datetime import datetime, timedelta, timezone

FORM = "QooEAY"
Q_PRENOM, Q_EMAIL = "P275Xd", "EB2QJq"
TALLY = os.environ["TALLY_API_KEY"]
BREVO = os.environ["BREVO_API_KEY"]
LIST_ID = int(os.environ["BREVO_LIST_ID"])
ATTR = os.environ.get("BREVO_FIRSTNAME_ATTR") or "PRENOM"
SINCE = datetime.now(timezone.utc) - timedelta(hours=int(os.environ.get("HOURS", "2")))

def call(url, headers, data=None):
    req = urllib.request.Request(url, data=json.dumps(data).encode() if data else None, headers=headers, method="POST" if data else "GET")
    with urllib.request.urlopen(req, timeout=30) as r:
        body = r.read()
        return json.loads(body) if body else {}

def submissions():
    page = 1
    while True:
        d = call(f"https://api.tally.so/forms/{FORM}/submissions?filter=completed&page={page}",
                 {"Authorization": f"Bearer {TALLY}"})
        for s in d.get("submissions", []):
            yield s
        if not d.get("hasMore"):
            return
        page += 1

added = errors = 0
for s in submissions():
    if datetime.fromisoformat(s["submittedAt"].replace("Z", "+00:00")) < SINCE:
        continue
    ans = {r["questionId"]: r.get("answer") for r in s["responses"]}
    email = (ans.get(Q_EMAIL) or "").strip().lower()
    if not email:
        continue
    contact = {"email": email, "listIds": [LIST_ID], "updateEnabled": True,
               "attributes": {ATTR: (ans.get(Q_PRENOM) or "").strip()}}
    try:
        call("https://api.brevo.com/v3/contacts", {"api-key": BREVO, "Content-Type": "application/json", "accept": "application/json"}, contact)
        added += 1
    except urllib.error.HTTPError as e:
        errors += 1
        print(f"Erreur Brevo pour {email}: {e.code} {e.read().decode()[:200]}", file=sys.stderr)
print(f"{added} contact(s) envoyé(s) à Brevo, {errors} erreur(s)")
sys.exit(1 if errors and not added else 0)
