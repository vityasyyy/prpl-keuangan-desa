import { createApbdHandler } from "./apbd/apbd.handler.js";
import { createBankDesaHandler } from "./bank-desa/bank-desa.handler.js";
import { createKasPembantuHandler } from "./kas-pembantu/kas-pembantu.handler.js";
import { createKasUmumHandler } from "./kas-umum/kas-umum.handler.js";
import { createRabHandler } from "./rab/rab.handler.js";

import { createApbdRepo } from "../../repository/apbd/apbd.repo.js";
import { createBankDesaRepo } from "../../repository/bank-desa/bank-desa.repo.js";
import { createKasPembantuRepo } from "../../repository/kas-pembantu/kas-pembantu.repo.js";
import { createKasUmumRepo } from "../../repository/kas-umum/kas-umum.repo.js";
import { createRabRepo } from "../../repository/rab/rab.repo.js";

import { createApbdService } from "../../service/apbd/apbd.service.js";
import { createBankDesaService } from "../../service/bank-desa/bank-desa.service.js";
import { createKasPembantuService } from "../../service/kas-pembantu/kas-pembantu.service.js";
import { createKasUmumService } from "../../service/kas-umum/kas-umum.service.js";
import { createRabService } from "../../service/rab/rab.service.js";

export async function createContainerHandler(db) {
  const apbdRepo = createApbdRepo(db);
  const bankDesaRepo = createBankDesaRepo(db);
  const kasPembantuRepo = createKasPembantuRepo(db);
  const kasUmumRepo = createKasUmumRepo(db);
  const rabRepo = createRabRepo(db);

  const apbdService = createApbdService(apbdRepo);
  const bankDesaService = createBankDesaService(bankDesaRepo);
  const kasPembantuService = createKasPembantuService(kasPembantuRepo);
  const kasUmumService = createKasUmumService(kasUmumRepo);
  const rabService = createRabService(rabRepo);

  const apbdHandler = createApbdHandler(apbdService);
  const bankDesaHandler = createBankDesaHandler(bankDesaService);
  const kasPembantuHandler = createKasPembantuHandler(kasPembantuService);
  const kasUmumHandler = createKasUmumHandler(kasUmumService);
  const rabHandler = createRabHandler(rabService);

  return {
    apbdHandler,
    bankDesaHandler,
    kasPembantuHandler,
    kasUmumHandler,
    rabHandler,
  };
}
