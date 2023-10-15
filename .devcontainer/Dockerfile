# Užijte menší základní obraz
FROM alpine:3.14 as builder

# Nainstalujte potřebné balíčky
RUN apk add --no-cache curl bash

# Nainstalujte Homebrew
RUN /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Nastavte proměnnou prostředí pro Homebrew
ENV PATH="/home/linuxbrew/.linuxbrew/bin:${PATH}"

# Nainstalujte k6, k9s a tig
RUN brew install k6 k9s tig

# Odstraňte nepotřebné soubory
RUN rm -rf /var/lib/apt/lists/*

# Vytvořte finální obraz
FROM alpine:3.14

# Kopírujte soubory z builder obrazu
COPY --from=builder /home/linuxbrew/.linuxbrew /home/linuxbrew/.linuxbrew

# Nastavte proměnnou prostředí pro Homebrew
ENV PATH="/home/linuxbrew/.linuxbrew/bin:${PATH}"
