# GitHub Actions - Kosten & Nutzung

## 💰 Sind GitHub Actions kostenpflichtig?

**Für öffentliche Repositories: NEIN! ✅**

### Kostenlos für Public Repos:
- ✅ **Unbegrenzte Minuten** für öffentliche Repositories
- ✅ **Unbegrenzte Storage** für Artifacts
- ✅ **Alle Runner-Typen** (Linux, Windows, macOS)

### Für private Repositories:
- 2.000 Minuten/Monat kostenlos (für Free-Accounts)
- Danach kostenpflichtig

**Dein Repo ist öffentlich → Komplett kostenlos! 🎉**

## 🔍 Aktuelle Workflows

### CI Workflow (`.github/workflows/ci.yml`)
**Trigger:** Bei jedem Push auf `main` oder Pull Request

**Was wird gemacht:**
1. ✅ Checkout Code
2. ✅ Setup Node.js 22
3. ✅ Install Dependencies (`npm ci`)
4. ✅ TypeScript Check (`npx tsc --noEmit`)
5. ✅ Build Application (`npm run build`)
6. ✅ Verify Build Artifacts

**Geschätzte Laufzeit:** ~2-3 Minuten pro Run

### Release Workflow (`.github/workflows/release.yml`)
**Trigger:** Nur bei Version Tags (`v*.*.*`)

**Was wird gemacht:**
1. ✅ Checkout Code
2. ✅ Extract Changelog
3. ✅ Create GitHub Release

**Geschätzte Laufzeit:** ~30 Sekunden pro Release

## 📊 Kosten-Übersicht

| Workflow | Trigger | Häufigkeit | Minuten/Monat | Kosten |
|----------|---------|------------|---------------|---------|
| CI | Push/PR | ~10x/Woche | ~120 min | **€0.00** |
| Release | Tags | ~1x/Woche | ~2 min | **€0.00** |
| **Total** | | | ~122 min | **€0.00** |

**Public Repo = Keine Kosten!**

## 🐛 Typische CI-Fehler und Lösungen

### 1. Build Fehler
**Problem:** `npm run build` schlägt fehl

**Lösung:**
```bash
# Lokal testen:
npm run build

# Wenn lokal OK, liegt es meist an:
- Fehlende .env Variablen (in CI nicht verfügbar)
- Platform-spezifische Dependencies
```

### 2. Hook Setup Fehler
**Problem:** `postinstall` Script schlägt fehl weil `.git` fehlt

**Lösung:** ✅ Bereits gefixt!
- Script prüft jetzt ob `.git` existiert
- Überspringt Hook-Setup in CI
- Exit 0 (kein Fehler)

### 3. TypeScript Errors
**Problem:** `tsc --noEmit` findet Fehler

**Lösung:**
```bash
# Lokal prüfen:
npx tsc --noEmit

# Fehler fixen und committen
```

## 📈 Usage Monitoring

### Aktuellen Status prüfen:

**Via Web:**
1. Gehe zu: https://github.com/utfcmac/local-ai/actions
2. Siehst du alle Workflow-Runs
3. Grün = Success, Rot = Failure

**Via GitHub CLI:**
```bash
# Installiere gh CLI (einmalig)
brew install gh

# Login
gh auth login

# Check runs
gh run list --limit 10

# Details zu einem Run
gh run view <run-id>
```

## ⚙️ Workflows optimieren

### Minuten sparen (falls nötig):

1. **Cache Dependencies:**
   ```yaml
   - uses: actions/setup-node@v4
     with:
       cache: 'npm'  # ← Bereits aktiviert!
   ```

2. **Skip CI wenn nicht nötig:**
   ```bash
   git commit -m "docs: update readme [skip ci]"
   ```

3. **Matrix Builds vermeiden:**
   - Nur eine Node.js Version (22)
   - Nur Linux Runner (günstigste Option)

## 🚨 Wenn CI fehlschlägt

### Debugging-Schritte:

1. **GitHub Actions Tab öffnen:**
   ```
   https://github.com/utfcmac/local-ai/actions
   ```

2. **Fehlgeschlagenen Run anklicken**

3. **Logs durchlesen:**
   - Roter Text = Fehler
   - Scroll zu erster Fehlermeldung

4. **Lokal reproduzieren:**
   ```bash
   npm ci           # Wie in CI
   npx tsc --noEmit # TypeScript Check
   npm run build    # Build Test
   ```

5. **Fix committen und pushen**

## 🔔 Benachrichtigungen

GitHub sendet automatisch E-Mails wenn:
- ❌ Workflow fehlschlägt
- ✅ Workflow nach Fehler wieder erfolgreich

**Benachrichtigungen anpassen:**
1. GitHub → Settings → Notifications
2. Actions → Konfigurieren

## 📝 Best Practices

### ✅ DO:
- CI bei jedem Push laufen lassen
- Fehler sofort fixen
- Lokale Tests vor dem Push
- Cache nutzen (bereits aktiv)

### ❌ DON'T:
- CI nicht deaktivieren
- Fehler ignorieren
- Zu viele Workflows erstellen
- Große Artifacts speichern

## 🎯 Zusammenfassung

**Für dein Projekt:**
- ✅ Public Repo = **Kostenlos**
- ✅ ~120 Minuten/Monat Nutzung
- ✅ Keine Limitierung
- ✅ 2 schlanke Workflows
- ✅ Optimal konfiguriert

**Keine Sorge um Kosten! 🎉**

## 📚 Weitere Infos

- [GitHub Actions Pricing](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Actions Marketplace](https://github.com/marketplace?type=actions)

---

**Fragen?** Siehe [MAINTAINER.md](../MAINTAINER.md) für weitere Infos.
