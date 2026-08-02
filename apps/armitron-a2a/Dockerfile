FROM node:22-slim

ENV NODE_ENV=production
ENV PORT=8080
ENV JP_ARMITRON_RECEIPTS=/tmp/armitron/receipts.jsonl
ENV JP_VTC_EXCHANGE_LEDGER=/tmp/armitron/vtc-exchange.jsonl

WORKDIR /app

COPY apps/armitron-a2a ./apps/armitron-a2a
COPY tools/armitron/v23 ./tools/armitron/v23
COPY tools/armitron/v25 ./tools/armitron/v25
COPY examples/armitron/v25 ./examples/armitron/v25

RUN useradd --create-home --uid 10001 armitron \
    && mkdir -p /tmp/armitron \
    && chown -R armitron:armitron /app /tmp/armitron

USER armitron

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8080/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "apps/armitron-a2a/server.mjs"]
