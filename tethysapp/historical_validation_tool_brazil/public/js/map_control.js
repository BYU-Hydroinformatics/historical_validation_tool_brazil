// ------------------------------------------------------------------------------------------------------------ //
//                                    DATA ON LOCALITIES AND BASIN DISTRICTS                                    //
// ------------------------------------------------------------------------------------------------------------ //

// Localities
let loc = [
    { name: "Acre", file: "ACRE.json" },
    { name: "Amapa", file: "AMAPA.json" },
    { name: "Amazonas", file: "AMAZONAS.json" },
    { name: "Bahia", file: "BAHIA.json" },
    { name: "Ceara", file: "CEARA.json"},
    { name: "Distrito Federal", file: "DISTRITO_FEDERAL.json"},
    { name: "Espirito Santo", file: "ESPIRITO_SANTO.json"},
    { name: "Goias", file: "GOIAS.json"},
    { name: "Maranhao", file: "MARANHAO.json"},
    { name: "Mato Grosso", file: "MATO_GROSSO.json"},
    { name: "Mato Grosso do Sul", file: "MATO_GROSSO_DO_SUL.json"},
    { name: "Minas Gerais", file: "MINAS_GERAIS.json"},
    { name: "Para", file: "PARA.json"},
    { name: "Paraiba", file: "PARAIBA.json"},
    { name: "Parana", file: "PARANA.json"},
    { name: "Pernambuco", file: "PERNAMBUCO.json"},
    { name: "Piaui", file: "PIAUI.json"},
    { name: "Rio de Janeiro", file: "RIO_DE_JANEIRO.json"},
    { name: "Rio Grande do Norte", file: "RIO_GRANDE_DO_NORTE.json"},
    { name: "Rio Grande do Sul", file: "RIO_GRANDE_DO_SUL.json"},
    { name: "Rondonia", file: "RONDONIA.json"},
    { name: "Roraima", file: "RORAIMA.json"},
    { name: "Santa Catarina", file: "SANTA_CATARINA.json"},
    { name: "Sao Paulo", file: "SAO_PAULO.json"},
    { name: "Sergipe", file: "SERGIPE.json"},
    { name: "Tocantins", file: "TOCANTINS.json" }
];
const loc_url = `${server}/static/historical_validation_tool_brazil/geojson/region/`


// River basin districts
let basin = [
    { name: "391 AMAPA LITORAL", file: "391_AMAPA_LITORAL.json"},
    { name: "411 FOZ AMAZONAS", file: "411_FOZ_AMAZONAS.json"},
    { name: "421 XINGU", file: "421_XINGU.json"},
    { name: "431 PARU", file: "431_PARU.json"},
    { name: "441 TAPAJOS", file: "441_TAPAJOS.json"},
    { name: "451 TROMBETAS", file: "451_TROMBETAS.json"},
    { name: "471 MADEIRA", file: "471_MADEIRA.json"},
    { name: "481 NEGRO", file: "481_NEGRO.json"},
    { name: "491 PURUS", file: "491_PURUS.json"},
    { name: "492 SOLIMOES", file: "492_SOLIMOES.json"},
    { name: "651 TOCANTINS BAIXO", file: "651_TOCANTINS_BAIXO.json"},
    { name: "661 TOCANTINS ALTO", file: "661_TOCANTINS_ALTO.json"},
    { name: "691 ARAGUAIA", file: "691_ARAGUAIA.json"},
    { name: "711 GURUPI", file: "711_GURUPI.json"},
    { name: "712 MEARIM", file: "712_MEARIM.json"},
    { name: "713 ITAPECURU", file: "713_ITAPECURU.json"},
    { name: "721 PARNAIBA BAIXO", file: "721_PARNAIBA_BAIXO.json"},
    { name: "722 PARNAIBA MEDIO", file: "722_PARNAIBA_MEDIO.json"},
    { name: "723 PARNAIBA ALTO", file: "723_PARNAIBA_ALTO.json"},
    { name: "731 LITORAL CE PI", file: "731_LITORAL_CE_PI.json"},
    { name: "732 JAGUARIBE", file: "732_JAGUARIBE.json"},
    { name: "733 PIRANHAS", file: "733_PIRANHAS.json"},
    { name: "734 LITORAL CE PB", file: "734_LITORAL_CE_PB.json"},
    { name: "735 PARAIBA", file: "735_PARAIBA.json"},
    { name: "736 LITORAL AL PE PB", file: "736_LITORAL_AL_PE_PB.json"},
    { name: "741 SAO FRANCISCO BAIXO", file: "741_SAO_FRANCISCO_BAIXO.json"},
    { name: "742 SAO FRANCISCO SUBMEDIO", file: "742_SAO_FRANCISCO_SUBMEDIO.json"},
    { name: "744 SAO FRANCISCO MEDIO", file: "744_SAO_FRANCISCO_MEDIO.json"},
    { name: "745 SAO FRANCISCO ALTO", file: "745_SAO_FRANCISCO_ALTO.json"},
    { name: "751 LITORAL SE", file: "751_LITORAL_SE.json"},
    { name: "752 ITAPECURU PARAGUACU", file: "752_ITAPECURU_PARAGUACU.json"},
    { name: "753 CONTAS", file: "753_CONTAS.json"},
    { name: "754 JEQUITINHONHA", file: "754_JEQUITINHONHA.json"},
    { name: "755 LITORAL BA ES", file: "755_LITORAL_BA_ES.json"},
    { name: "761 DOCE", file: "761_DOCE.json"},
    { name: "771 LITORAL ES", file: "771_LITORAL_ES.json"},
    { name: "772 PARAIBA DO SUL", file: "772_PARAIBA_DO_SUL.json"},
    { name: "773 LITORAL RJ", file: "773_LITORAL_RJ.json"},
    { name: "774 LITORAL SP", file: "774_LITORAL_SP.json"},
    { name: "775 LITORAL RJ SP", file: "775_LITORAL_RJ_SP.json"},
    { name: "776 LITORAL SP PR SC", file: "776_LITORAL_SP_PR_SC.json"},
    { name: "777 GUAIBA", file: "777_GUAIBA.json"},
    { name: "778 LITORAL RS", file: "778_LITORAL_RS.json"},
    { name: "780 NEGRO RS", file: "780_NEGRO_RS.json"},
    { name: "781 URUGUAI MEDIO", file: "781_URUGUAI_MEDIO.json"},
    { name: "782 IBICUI", file: "782_IBICUI.json"},
    { name: "784 URUGUAI ALTO", file: "784_URUGUAI_ALTO.json"},
    { name: "840 IGUACU", file: "840_IGUACU.json"},
    { name: "841 PARANA RH1", file: "841_PARANA_RH1.json"},
    { name: "842 PARANAPANEMA", file: "842_PARANAPANEMA.json"},
    { name: "844 TIETE", file: "844_TIETE.json"},
    { name: "848 GRANDE", file: "848_GRANDE.json"},
    { name: "849 PARANAIBA", file: "849_PARANAIBA.json"},
    { name: "891 PARAGUAI 01", file: "891_PARAGUAI_01.json"},
    { name: "892 PARAGUAI 02", file: "892_PARAGUAI_02.json"},
    { name: "893 PARAGUAI 03", file: "893_PARAGUAI_03.json"}
];
const basin_url = `${server}/static/historical_validation_tool_brazil/geojson/basin/`


// River basin districts
let subbasin = [
    { name: "391 108 LITORAL AP 01", file: "391_108_LITORAL_AP_01.json" },
    { name: "391 160 OIAPOQUE ALTO", file: "391_160_OIAPOQUE_ALTO.json" },
    { name: "391 21 ARAGUARI AP", file: "391_21_ARAGUARI_AP.json" },
    { name: "391 260 UACA", file: "391_260_UACA.json" },
    { name: "411 10 AMAZONAS 08", file: "411_10_AMAZONAS_08.json" },
    { name: "411 11 AMAZONAS 09", file: "411_11_AMAZONAS_09.json" },
    { name: "411 144 MARAJO", file: "411_144_MARAJO.json" },
    { name: "411 98 JARI", file: "411_98_JARI.json" },
    { name: "411 9 AMAZONAS 07", file: "411_9_AMAZONAS_07.json" },
    { name: "421 271 XINGU 01", file: "421_271_XINGU_01.json" },
    { name: "421 272 XINGU 02", file: "421_272_XINGU_02.json" },
    { name: "421 273 XINGU 03", file: "421_273_XINGU_03.json" },
    { name: "421 77 IRIRI", file: "421_77_IRIRI.json" },
    { name: "431 40 CURUA UNA", file: "431_40_CURUA_UNA.json" },
    { name: "431 7 AMAZONAS 05", file: "431_7_AMAZONAS_05.json" },
    { name: "431 8 AMAZONAS 06", file: "431_8_AMAZONAS_06.json" },
    { name: "441 105 JUREMA", file: "441_105_JUREMA.json" },
    { name: "441 235 TAPAJOS 01", file: "441_235_TAPAJOS_01.json" },
    { name: "441 236 TAPAJOS 02", file: "441_236_TAPAJOS_02.json" },
    { name: "441 240 TELES PIRES", file: "441_240_TELES_PIRES.json" },
    { name: "441 95 JAMANXIM", file: "441_95_JAMANXIM.json" },
    { name: "451 258 TROMBETAS", file: "451_258_TROMBETAS.json" },
    { name: "451 4 AMAZONAS 02", file: "451_4_AMAZONAS_02.json" },
    { name: "451 5 AMAZONAS 03", file: "451_5_AMAZONAS_03.json" },
    { name: "451 6 AMAZONAS 04", file: "451_6_AMAZONAS_04.json" },
    { name: "471 138 MACHADO", file: "471_138_MACHADO.json" },
    { name: "471 139 MADEIRA 01", file: "471_139_MADEIRA_01.json" },
    { name: "471 140 MADEIRA 02", file: "471_140_MADEIRA_02.json" },
    { name: "471 141 MADEIRA 03", file: "471_141_MADEIRA_03.json" },
    { name: "471 142 MADEIRA 04", file: "471_142_MADEIRA_04.json" },
    { name: "471 143 MADEIRA 05", file: "471_143_MADEIRA_05.json" },
    { name: "471 3 AMAZONAS 01", file: "471_3_AMAZONAS_01.json" },
    { name: "471 96 JAMARI", file: "471_96_JAMARI.json" },
    { name: "481 154 NEGRO 01", file: "481_154_NEGRO_01.json" },
    { name: "481 155 NEGRO 02", file: "481_155_NEGRO_02.json" },
    { name: "481 156 NEGRO 03", file: "481_156_NEGRO_03.json" },
    { name: "481 157 NEGRO 04", file: "481_157_NEGRO_04.json" },
    { name: "491 207 PURUS 01", file: "491_207_PURUS_01.json" },
    { name: "491 208 PURUS 02", file: "491_208_PURUS_02.json" },
    { name: "491 209 PURUS 03", file: "491_209_PURUS_03.json" },
    { name: "491 209 PURUS 03", file: "491_214_RIO_ACRE.json" },
    { name: "491 232 SOLIMOES 02", file: "491_232_SOLIMOES_02.json" },
    { name: "492 100 JAVARI", file: "492_100_JAVARI.json" },
    { name: "492 106 JURUA", file: "492_106_JURUA.json" },
    { name: "492 107 JUTAI", file: "492_107_JUTAI.json" },
    { name: "492 231 SOLIMOES 01", file: "492_231_SOLIMOES_01.json" },
    { name: "492 233 SOLIMOES 03", file: "492_233_SOLIMOES_03.json" },
    { name: "492 97 JAPURA", file: "492_97_JAPURA.json" },
    { name: "651 163 PARA TOCANTINS", file: "651_163_PARA_TOCANTINS.json" },
    { name: "651 1 ACARA", file: "651_1_ACARA.json" },
    { name: "651 255 TOCANTINS 08", file: "651_255_TOCANTINS_08.json" },
    { name: "651 256 TOCANTINS 09", file: "651_256_TOCANTINS_09.json" },
    { name: "651 47 FOZ TOCANTINS", file: "651_47_FOZ_TOCANTINS.json" },
    { name: "651 68 GUAMA", file: "651_68_GUAMA.json" },
    { name: "661 248 TOCANTINS 01", file: "661_248_TOCANTINS_01.json" },
    { name: "661 249 TOCANTINS 02", file: "661_249_TOCANTINS_02.json" },
    { name: "661 250 TOCANTINS 03", file: "661_250_TOCANTINS_03.json" },
    { name: "661 251 TOCANTINS 04", file: "661_251_TOCANTINS_04.json" },
    { name: "661 252 TOCANTINS 05", file: "661_252_TOCANTINS_05.json" },
    { name: "661 253 TOCANTINS 06", file: "661_253_TOCANTINS_06.json" },
    { name: "661 254 TOCANTINS 07", file: "661_254_TOCANTINS_07.json" },
    { name: "691 15 ARAGUAIA 01", file: "691_15_ARAGUAIA_01.json" },
    { name: "691 16 ARAGUAIA 02", file: "691_16_ARAGUAIA_02.json" },
    { name: "691 17 ARAGUAIA 03", file: "691_17_ARAGUAIA_03.json" },
    { name: "691 18 ARAGUAIA 04", file: "691_18_ARAGUAIA_04.json" },
    { name: "691 19 ARAGUAIA 05", file: "691_19_ARAGUAIA_05.json" },
    { name: "711 116 LITORAL PA 01", file: "711_116_LITORAL_PA_01.json" },
    { name: "711 117 LITORAL PA 02", file: "711_117_LITORAL_PA_02.json" },
    { name: "711 200 PERICUMA", file: "711_200_PERICUMA.json" },
    { name: "711 259 TURIACU", file: "711_259_TURIACU.json" },
    { name: "711 69 GURUPI", file: "711_69_GURUPI.json" },
    { name: "712 145 MEARIM", file: "712_145_MEARIM.json" },
    { name: "713 112 LITORAL MA 01", file: "713_112_LITORAL_MA_01.json" },
    { name: "713 152 MUNIM", file: "713_152_MUNIM.json" },
    { name: "713 80 ITAPECURU", file: "713_80_ITAPECURU.json" },
    { name: "721 197 PARNAIBA 07", file: "721_197_PARNAIBA_07.json" },
    { name: "722 195 PARNAIBA 05", file: "722_195_PARNAIBA_05.json" },
    { name: "722 196 PARNAIBA 06", file: "722_196_PARNAIBA_06.json" },
    { name: "723 191 PARNAIBA 01", file: "723_191_PARNAIBA_01.json" },
    { name: "723 192 PARNAIBA 02", file: "723_192_PARNAIBA_02.json" },
    { name: "723 193 PARNAIBA 03", file: "723_193_PARNAIBA_03.json" },
    { name: "723 194 PARNAIBA 04", file: "723_194_PARNAIBA_04.json" },
    { name: "731 109 LITORAL CE 01", file: "731_109_LITORAL_CE_01.json" },
    { name: "731 147 METROPOLITANA", file: "731_147_METROPOLITANA.json" },
    { name: "731 2 ACARAU", file: "731_2_ACARAU.json" },
    { name: "731 33 COREAU", file: "731_33_COREAU.json" },
    { name: "731 39 CURU", file: "731_39_CURU.json" },
    { name: "732 90 JAGUARIBE 01", file: "732_90_JAGUARIBE_01.json" },
    { name: "732 91 JAGUARIBE 02", file: "732_91_JAGUARIBE_02.json" },
    { name: "732 92 JAGUARIBE 03", file: "732_92_JAGUARIBE_03.json" },
    { name: "732 93 JAGUARIBE 04", file: "732_93_JAGUARIBE_04.json" },
    { name: "732 94 JAGUARIBE 05", file: "732_94_JAGUARIBE_05.json" },
    { name: "733 13 APODI", file: "733_13_APODI.json" },
    { name: "733 202 PIRANHAS", file: "733_202_PIRANHAS.json" },
    { name: "734 124 LITORAL RN", file: "734_124_LITORAL_RN.json" },
    { name: "734 136 LITORAL SUL RN E NORTE PB", file: "734_136_LITORAL_SUL_RN_E_NORTE_PB.json"},
    { name: "734 205 POTENGI", file: "734_205_POTENGI.json" },
    { name: "734 257 TRAIRI", file: "734_257_TRAIRI.json" },
    { name: "734 30 CEARA MIRIM", file: "734_30_CEARA_MIRIM.json" },
    { name: "735 169 PARAIBA 01", file: "735_169_PARAIBA_01.json" },
    { name: "735 170 PARAIBA 02", file: "735_170_PARAIBA_02.json" },
    { name: "736 118 LITORAL PE PB", file: "736_118_LITORAL_PE_PB.json" },
    { name: "736 135 LITORAL SUL PE", file: "736_135_LITORAL_SUL_PE.json" },
    { name: "736 151 MUNDAU", file: "736_151_MUNDAU.json" },
    { name: "736 28 CAPIBARIBE", file: "736_28_CAPIBARIBE.json" },
    { name: "741 226 SAO FRANCISCO 09", file: "741_226_SAO_FRANCISCO_09.json"},
    { name: "742 149 MOXOTO", file: "742_149_MOXOTO.json" },
    { name: "742 162 PAJEU", file: "742_162_PAJEU.json" },
    { name: "742 223 SAO FRANCISCO 06", file: "742_223_SAO_FRANCISCO_06.json" },
    { name: "742 224 SAO FRANCISCO 07", file: "742_224_SAO_FRANCISCO_07.json"},
    { name: "742 225 SAO FRANCISCO 08", file: "742_225_SAO_FRANCISCO_08.json"},
    { name: "742 25 BRIGIDA", file: "742_25_BRIGIDA.json" },
    { name: "744 161 PACUI", file: "744_161_PACUI.json" },
    { name: "744 165 PARACATU", file: "744_165_PARACATU.json" },
    { name: "744 220 SAO FRANCISCO 03", file: "744_220_SAO_FRANCISCO_03.json"},
    { name: "744 221 SAO FRANCISCO 04", file: "744_221_SAO_FRANCISCO_04.json"},
    { name: "744 222 SAO FRANCISCO 05", file: "744_222_SAO_FRANCISCO_05.json"},
    { name: "744 261 URUCUIA", file: "744_261_URUCUIA.json" },
    { name: "744 269 VERDE GRANDE", file: "744_269_VERDE_GRANDE.json" },
    { name: "744 29 CARINHANHA", file: "744_29_CARINHANHA.json" },
    { name: "744 34 CORRENTE", file: "744_34_CORRENTE.json" },
    { name: "744 63 GRANDE SF 01", file: "744_63_GRANDE_SF_01.json" },
    { name: "744 64 GRANDE SF 02", file: "744_64_GRANDE_SF_02.json" },
    { name: "745 101 JEQUITAI", file: "745_101_JEQUITAI.json" },
    { name: "745 164 PARA SF", file: "745_164_PARA_SF.json" },
    { name: "745 187 PARAOPEBA", file: "745_187_PARAOPEBA.json" },
    { name: "745 218 SAO FRANCISCO 01", file: "745_218_SAO_FRANCISCO_01.json"},
    {
      name: "745 219 SAO FRANCISCO 02",
      file: "745_219_SAO_FRANCISCO_02.json"
    },
    { name: "745 268 VELHAS", file: "745_268_VELHAS.json" },
    { name: "751 132 LITORAL SE 01", file: "751_132_LITORAL_SE_01.json" },
    { name: "751 133 LITORAL SE 02", file: "751_133_LITORAL_SE_02.json" },
    { name: "751 267 VAZA BARRIS", file: "751_267_VAZA_BARRIS.json" },
    { name: "752 166 PARAGUACU", file: "752_166_PARAGUACU.json" },
    { name: "752 211 RECONCAVO 01", file: "752_211_RECONCAVO_01.json" },
    { name: "752 212 RECONCAVO 02", file: "752_212_RECONCAVO_02.json" },
    { name: "752 82 ITAPICURU", file: "752_82_ITAPICURU.json" },
    { name: "753 32 CONTAS 01", file: "753_32_CONTAS_01.json" },
    {
      name: "754 102 JEQUITINHONHA 01",
      file: "754_102_JEQUITINHONHA_01.json"
    },
    {
      name: "754 102 JEQUITINHONHA 01",
      file: "754_103_JEQUITINHONHA_02.json"
    },
    {
      name: "754 104 JEQUITINHONHA 03",
      file: "754_104_JEQUITINHONHA_03.json"
    },
    { name: "754 188 PARDO", file: "754_188_PARDO.json" },
    {
      name: "755 134 LITORAL SUL BA 01",
      file: "755_134_LITORAL_SUL_BA_01.json"
    },
    { name: "755 150 MUCURI", file: "755_150_MUCURI.json" },
    { name: "755 228 SAO MATEUS", file: "755_228_SAO_MATEUS.json" },
    { name: "755 84 ITAUNAS", file: "755_84_ITAUNAS.json" },
    { name: "761 23 BARRA SECA", file: "761_23_BARRA_SECA.json" },
    { name: "761 41 DOCE 01", file: "761_41_DOCE_01.json" },
    { name: "761 42 DOCE 02", file: "761_42_DOCE_02.json" },
    { name: "761 43 DOCE 03", file: "761_43_DOCE_03.json" },
    { name: "761 44 DOCE 04", file: "761_44_DOCE_04.json" },
    { name: "761 45 DOCE 05", file: "761_45_DOCE_05.json" },
    { name: "761 46 DOCE 06", file: "761_46_DOCE_06.json" },
    { name: "771 110 LITORAL ES 01", file: "771_110_LITORAL_ES_01.json" },
    { name: "771 111 LITORAL ES 02", file: "771_111_LITORAL_ES_02.json" },
    { name: "771 215 SANTA MARIA ES", file: "771_215_SANTA_MARIA_ES.json" },
    { name: "771 78 ITABAPOANA", file: "771_78_ITABAPOANA.json" },
    { name: "771 81 ITAPEMIRIM", file: "771_81_ITAPEMIRIM.json" },
    { name: "771 87 JUCU", file: "771_87_JUCU.json" },
    {
      name: "772 171 PARAIBA DO SUL 01",
      file: "772_171_PARAIBA_DO_SUL_01.json"
    },
    {
      name: "772 172 PARAIBA DO SUL 02",
      file: "772_172_PARAIBA_DO_SUL_02.json"
    },
    {
      name: "772 173 PARAIBA DO SUL 03",
      file: "772_173_PARAIBA_DO_SUL_03.json"
    },
    {
      name: "772 174 PARAIBA DO SUL 04",
      file: "772_174_PARAIBA_DO_SUL_04.json"
    },
    { name: "772 204 POMBA", file: "772_204_POMBA.json" },
    {
      name: "772 206 PRETO PARAIBA DO SUL",
      file: "772_206_PRETO_PARAIBA_DO_SUL.json"
    },
    { name: "773 120 LITORAL RJ 01", file: "773_120_LITORAL_RJ_01.json" },
    { name: "773 121 LITORAL RJ 02", file: "773_121_LITORAL_RJ_02.json" },
    { name: "773 122 LITORAL RJ 03", file: "773_122_LITORAL_RJ_03.json" },
    { name: "773 123 LITORAL RJ 04", file: "773_123_LITORAL_RJ_04.json" },
    { name: "774 LITORAL SP", file: "774_LITORAL_SP.json" },
    {
      name: "774 114 LITORAL NORTE SP 01",
      file: "774_114_LITORAL_NORTE_SP_01.json"
    },
    {
      name: "774 115 LITORAL NORTE SP 02",
      file: "774_115_LITORAL_NORTE_SP_02.json"
    },
    {
      name: "775 213 RIBEIRA DO IGUAPE",
      file: "775_213_RIBEIRA_DO_IGUAPE.json"
    },
    {
      name: "776 113 LITORAL NORTE SC 01",
      file: "776_113_LITORAL_NORTE_SC_01.json"
    },
    { name: "776 119 LITORAL PR 01", file: "776_119_LITORAL_PR_01.json" },
    {
      name: "776 129 LITORAL RS SC 01",
      file: "776_129_LITORAL_RS_SC_01.json"
    },
    {
      name: "776 130 LITORAL RS SC 02",
      file: "776_130_LITORAL_RS_SC_02.json"
    },
    {
      name: "776 131 LITORAL RS SC 03",
      file: "776_131_LITORAL_RS_SC_03.json"
    },
    { name: "776 137 LITORAL SUL SP", file: "776_137_LITORAL_SUL_SP.json" },
    { name: "776 79 ITAJAI", file: "776_79_ITAJAI.json" },
    { name: "777 190 PARDO RS", file: "777_190_PARDO_RS.json" },
    { name: "777 230 SINOS", file: "777_230_SINOS.json" },
    { name: "777 237 TAQUARI", file: "777_237_TAQUARI.json" },
    { name: "777 266 VACACAI", file: "777_266_VACACAI.json" },
    { name: "777 26 CAI", file: "777_26_CAI.json" },
    { name: "777 65 GRAVATAI", file: "777_65_GRAVATAI.json" },
    { name: "777 66 GUAIBA 01", file: "777_66_GUAIBA_01.json" },
    { name: "777 67 GUAIBA 02", file: "777_67_GUAIBA_02.json" },
    { name: "777 88 JACUI ALTO", file: "777_88_JACUI_ALTO.json" },
    { name: "778 125 LITORAL RS 01", file: "778_125_LITORAL_RS_01.json" },
    { name: "778 126 LITORAL RS 02", file: "778_126_LITORAL_RS_02.json" },
    { name: "778 127 LITORAL RS 03", file: "778_127_LITORAL_RS_03.json" },
    { name: "778 128 LITORAL RS 04", file: "778_128_LITORAL_RS_04.json" },
    { name: "778 89 JAGUARAO", file: "778_89_JAGUARAO.json" },
    { name: "780 159 NEGRO RS", file: "780_159_NEGRO_RS.json" },
    { name: "781 210 QUARAI", file: "781_210_QUARAI.json" },
    { name: "781 262 URUGUAI INT 01", file: "781_262_URUGUAI_INT_01.json" },
    { name: "781 263 URUGUAI INT 02", file: "781_263_URUGUAI_INT_02.json" },
    { name: "781 76 IJUI", file: "781_76_IJUI.json" },
    { name: "782 216 SANTA MARIA RS", file: "782_216_SANTA_MARIA_RS.json" },
    { name: "782 264 URUGUAI INT 03", file: "782_264_URUGUAI_INT_03.json" },
    { name: "784 199 PELOTAS", file: "784_199_PELOTAS.json" },
    { name: "784 265 URUGUAI NAC", file: "784_265_URUGUAI_NAC.json" },
    { name: "784 27 CANOAS", file: "784_27_CANOAS.json" },
    { name: "840 70 IGUACU 01", file: "840_70_IGUACU_01.json" },
    { name: "840 71 IGUACU 02", file: "840_71_IGUACU_02.json" },
    { name: "840 72 IGUACU 03", file: "840_72_IGUACU_03.json" },
    { name: "840 73 IGUACU 04", file: "840_73_IGUACU_04.json" },
    { name: "840 74 IGUACU 05", file: "840_74_IGUACU_05.json" },
    { name: "841 175 PARANA 01", file: "841_175_PARANA_01.json" },
    { name: "841 176 PARANA 02", file: "841_176_PARANA_02.json" },
    { name: "841 177 PARANA 03", file: "841_177_PARANA_03.json" },
    { name: "841 178 PARANA 04", file: "841_178_PARANA_04.json" },
    { name: "841 189 PARDO PR", file: "841_189_PARDO_PR.json" },
    { name: "841 198 PEIXE SP", file: "841_198_PEIXE_SP.json" },
    { name: "841 201 PIQUIRI", file: "841_201_PIQUIRI.json" },
    { name: "841 234 SUCURIU", file: "841_234_SUCURIU.json" },
    { name: "841 270 VERDE PR", file: "841_270_VERDE_PR.json" },
    { name: "841 75 AGUAPEI", file: "841_75_AGUAPEI.json" },
    { name: "842 182 PARANAPANEMA 01", file: "842_182_PARANAPANEMA_01.json" },
    { name: "842 183 PARANAPANEMA 02", file: "842_183_PARANAPANEMA_02.json" },
    { name: "842 184 PARANAPANEMA 03", file: "842_184_PARANAPANEMA_03.json" },
    { name: "842 185 PARANAPANEMA 04", file: "842_185_PARANAPANEMA_04.json" },
    { name: "842 186 PARANAPANEMA 05", file: "842_186_PARANAPANEMA_05.json" },
    { name: "842 203 PIRAPO", file: "842_203_PIRAPO.json" },
    { name: "842 241 TIBAGI", file: "842_241_TIBAGI.json" },
    { name: "842 31 CINZAS", file: "842_31_CINZAS.json" },
    { name: "844 242 TIETE 01", file: "844_242_TIETE_01.json" },
    { name: "844 244 TIETE 03", file: "844_244_TIETE_03.json" },
    { name: "844 243 TIETE 02", file: "844_243_TIETE_02.json" },
    { name: "844 245 TIETE 04", file: "844_245_TIETE_04.json" },
    { name: "844 246 TIETE 05", file: "844_246_TIETE_05.json" },
    { name: "844 247 TIETE 06", file: "844_247_TIETE_06.json" },
    { name: "848 48 GRANDE PR 01", file: "848_48_GRANDE_PR_01.json" },
    { name: "848 49 GRANDE PR 02", file: "848_49_GRANDE_PR_02.json" },
    { name: "848 50 GRANDE PR 03", file: "848_50_GRANDE_PR_03.json" },
    { name: "848 51 GRANDE PR 04", file: "848_51_GRANDE_PR_04.json" },
    { name: "848 52 GRANDE PR 05", file: "848_52_GRANDE_PR_05.json" },
    { name: "848 53 GRANDE PR 06", file: "848_53_GRANDE_PR_06.json" },
    { name: "848 54 GRANDE PR 07", file: "848_54_GRANDE_PR_07.json" },
    { name: "848 55 GRANDE PR 08", file: "848_55_GRANDE_PR_08.json" },
    { name: "848 56 GRANDE PR 09", file: "848_56_GRANDE_PR_09.json" },
    { name: "848 57 GRANDE PR 10", file: "848_57_GRANDE_PR_10.json" },
    { name: "848 58 GRANDE PR 11", file: "848_58_GRANDE_PR_11.json" },
    { name: "848 59 GRANDE PR 12", file: "848_59_GRANDE_PR_12.json" },
    { name: "848 60 GRANDE PR 13", file: "848_60_GRANDE_PR_13.json" },
    { name: "848 61 GRANDE PR 14", file: "848_61_GRANDE_PR_14.json" },
    { name: "848 62 GRANDE PR 15", file: "848_62_GRANDE_PR_15.json" },
    { name: "849 146 MEIA PONTE", file: "849_146_MEIA_PONTE.json" },
    { name: "849 179 PARANAIBA 01", file: "849_179_PARANAIBA_01.json" },
    { name: "849 180 PARANAIBA 02", file: "849_180_PARANAIBA_02.json" },
    { name: "849 181 PARANAIBA 03", file: "849_181_PARANAIBA_03.json" },
    { name: "849 20 ARAGUARI", file: "849_20_ARAGUARI.json" },
    { name: "849 24 BOIS", file: "849_24_BOIS.json" },
    { name: "849 35 CORUMBA", file: "849_35_CORUMBA.json" },
    { name: "891 12 APA", file: "891_12_APA.json" },
    { name: "891 148 MIRANDA", file: "891_148_MIRANDA.json" },
    { name: "891 14 AQUIDAUANA", file: "891_14_AQUIDAUANA.json" },
    { name: "891 153 NABILEQUE", file: "891_153_NABILEQUE.json" },
    { name: "892 158 NEGRO MS 01", file: "892_158_NEGRO_MS_01.json" },
    { name: "892 238 TAQUARI 01", file: "892_238_TAQUARI_01.json" },
    { name: "892 239 TAQUARI 02", file: "892_239_TAQUARI_02.json" },
    { name: "893 167 PARAGUAI 01", file: "893_167_PARAGUAI_01.json" },
    {
      name: "893 168 PARAGUAI PANT 01",
      file: "893_168_PARAGUAI_PANT_01.json"
    },
    {
      name: "893 217 SANTA RITA PARAGUAI",
      file: "893_217_SANTA_RITA_PARAGUAI.json"
    },
    { name: "893 227 SAO LOURENCO", file: "893_227_SAO_LOURENCO.json" },
    { name: "893 229 SEPOTUBA", file: "893_229_SEPOTUBA.json" },
    { name: "893 36 CUIABA 01", file: "893_36_CUIABA_01.json" },
    { name: "893 37 CUIABA 02", file: "893_37_CUIABA_02.json" },
    { name: "893 38 CUIABA 03", file: "893_38_CUIABA_03.json" },
    { name: "893 85 ITIQUIRA", file: "893_85_ITIQUIRA.json" },
    { name: "893 99 JAURU", file: "893_99_JAURU.json" }
];
const subbasin_url = `${server}/static/historical_validation_tool_brazil/geojson/subbasin/`




// ------------------------------------------------------------------------------------------------------------ //
//                                           MAP CONTROL - CONTAINER                                            //
// ------------------------------------------------------------------------------------------------------------ //

// Define the control panel container
var info = L.control({position:'bottomleft'}); 

// Configure the control panel container
info.onAdd = function (map) {
    // Generate options for Localities
    loc = loc.map((item) => {
            var option_custom = `<option value="${item.file}">${item.name}</option>`;
            return(option_custom);
          }).join("");
          
    // Generate options for River basin districts
    basin = basin.map((item) => {
        var option_custom = `<option value="${item.file}">${item.name}</option>`;
        return(option_custom);
      }).join("");

    // Generate options for River basin districts
    subbasin = subbasin.map((item) => {
        var option_custom = `<option value="${item.file}">${item.name}</option>`;
        return(option_custom);
      }).join("");
    
    // Create the control panel DOM
    this._div = L.DomUtil.create('div', 'control')
    this._div.innerHTML =  `<div class="control-group">
                                <label class="label-control" for="select-loc">Warning levels (Geoglows):</label>
                                <div class="alert-panel-checkbox">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="check-000yr" checked>
                                        <label class="form-check-label" for="check-000yr">No warnings</label>
                                    </div>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="check-002yr" checked>
                                        <label class="form-check-label" for="check-002yr">2-years warnings</label>
                                    </div>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="check-005yr" checked>
                                        <label class="form-check-label" for="check-005yr">5-years warnings</label>
                                    </div>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="check-010yr" checked>
                                        <label class="form-check-label" for="check-010yr">10-years warnings</label>
                                    </div>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="check-025yr" checked>
                                        <label class="form-check-label" for="check-025yr">25-years warnings</label>
                                    </div>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="check-050yr" checked>
                                        <label class="form-check-label" for="check-050yr">50-years warnings</label>
                                    </div>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="check-100yr" checked>
                                        <label class="form-check-label" for="check-100yr">100-years warnings</label>
                                    </div>
                                </div>
                                <br>
                                <label class="label-control" for="select-loc">Zoom to a region:</label>
                                <select id="select-loc" required class="demo-default" placeholder="Select a region." name="loc">
                                    <option value="">Select a region.</option>
                                    ${loc}
                                </select>
                                <br>
                                <label class="label-control" for="select-basin">Zoom to a basin:</label>
                                <select id="select-basin" required class="demo-default" placeholder="Select a basin." name="basin">
                                    <option value="">Select a basin.</option>
                                    ${basin}
                                </select>
                                <br>
                                <label class="label-control" for="select-subbasin">Zoom to a subbasin:</label>
                                <select id="select-subbasin" required class="demo-default" placeholder="Select a subbasin." name="subbasin">
                                    <option value="">Select a subbasin.</option>
                                    ${subbasin}
                                </select>
                                <br>
                                <label class="label-control" for="select-station">Search Hydrological station:</label>
                                <select id="select-station" multiple placeholder="Write the station code or name."></select>
                                <br>
                                <label class="label-control" for="select-river">Search river:</label>
                                <select id="select-river" multiple placeholder="Write the river name."></select>
                                <br>
                                <label for="shpFile" class="label-control">Custom area (SHP):</label>
                                <input class="form-control" type="file" id="shpFile" accept=".shp">
                                
                                <br>
                                
                            </div>`;
    return this._div;
};

// Add the control panel container to the map
info.addTo(map);



// ------------------------------------------------------------------------------------------------------------ //
//                                     MAP CONTROL - SELECT BOXES AND ZOOM                                      //
// ------------------------------------------------------------------------------------------------------------ //

// Select box for ZOOM to localities (Provincias)
$('#select-loc').selectize({
    create: false,
    sortField: { field: 'text', direction: 'asc'},
    onChange: function(value, isOnInitialize) {
        // Retrieve geojson from REST API
        fetch(`${loc_url}${value}`)
        .then((response) => (layer = response.json()))
        .then((layer) => {
            // Remove the current layer
            if (typeof layerSHP !== 'undefined') {
                map.removeLayer(layerSHP)
            }
            // Add retrieved layer and fit to map
            layerSHP = L.geoJSON(layer, { style: { weight: 1 } }).addTo(map);
            map.fitBounds(layerSHP.getBounds());
        });
    }
});


// Select box for ZOOM to to basin district
$('#select-basin').selectize({
    create: true,
    sortField: { field: 'text', direction: 'asc'},
    onChange: function(value, isOnInitialize) {
        // Retrieve geojson from REST API
        fetch(`${basin_url}${value}`)
        .then((response) => (layer = response.json()))
        .then((layer) => {
            // Remove the current layer
            if (typeof layerSHP !== 'undefined') {
                map.removeLayer(layerSHP)
            }
            // Add retrieved layer and fit to map
            layerSHP = L.geoJSON(layer, { style: { weight: 1 } }).addTo(map);
            map.fitBounds(layerSHP.getBounds());
        });
    }
});

// Select box for ZOOM to to subbasin district
$('#select-subbasin').selectize({
    create: true,
    sortField: { field: 'text', direction: 'asc'},
    onChange: function(value, isOnInitialize) {
        // Retrieve geojson from REST API
        fetch(`${subbasin_url}${value}`)
        .then((response) => (layer = response.json()))
        .then((layer) => {
            // Remove the current layer
            if (typeof layerSHP !== 'undefined') {
                map.removeLayer(layerSHP)
            }
            // Add retrieved layer and fit to map
            layerSHP = L.geoJSON(layer, { style: { weight: 1 } }).addTo(map);
            map.fitBounds(layerSHP.getBounds());
        });
    }
});


//  Select box for ZOOM to stations and rivers
fetch("get-stations")
    .then((response) => (layer = response.json()))
    .then((layer) => {
        // Format json as input of selectize
        est_layer = layer.features.map(item => item.properties);
        // Rendering the select box for stations
        $('#select-station').selectize({
            maxItems: 1,
            options: est_layer,
            valueField: 'code',
            labelField:  'concat',
            searchField: ['codigo', 'name', 'concat'],
            create: false,
            onChange: function(value, isOnInitialize) {
                // Station item selected
                est_item = est_layer.filter(item => item.code == value)[0];
                // Remove marker if exists
                if (typeof ss_marker !== 'undefined') {
                    map.removeLayer(ss_marker)
                }
                // Add marker to selected station
                ss_marker = L.circleMarker([est_item.latitude, est_item.longitude], {
                    radius : 7,
                    color  : '#AD2745',
                    opacity: 0.75,
                  }).addTo(map);
                // Bounds
                southWest = L.latLng(est_item.latitude - 0.01, est_item.longitude - 0.01);
                northEast = L.latLng(est_item.latitude + 0.01, est_item.longitude + 0.01);
                bounds = L.latLngBounds(southWest, northEast);
                // Fit the map
                map.fitBounds(bounds);
            }
        });

        // Rendering the select box for rivers
        $('#select-river').selectize({
            maxItems: 1,
            options: est_layer,
            valueField:  'river',
            labelField:  'river',
            searchField: 'river',
            create: false,
            onChange: function(value, isOnInitialize) {
                // Station item selected
                river_item = est_layer.filter(item => item.river == value);
                // Remove marker if exists
                if (typeof ss_marker !== 'undefined') {
                    map.removeLayer(ss_marker)
                }
                // Create the layer Groups that contain the selected stations
                ss_marker = L.layerGroup();
                // Add marker to visualize the selected stations
                river_item.map(item => {
                    //L.marker([item.latitud, item.longitud]).addTo(ss_river)
                    L.circleMarker([item.latitude, item.longitude], {
                        radius : 7,
                        color  : '#AD2745',
                        opacity: 0.75,
                      }).addTo(ss_marker);
                });
                ss_marker.addTo(map);
                
                // Coordinates of selected stations
                lon_item = river_item.map(item => item.longitude);
                lat_item = river_item.map(item => item.latitude);
                // Bounds
                southWest = L.latLng(Math.min(...lat_item), Math.min(...lon_item));
                northEast = L.latLng(Math.max(...lat_item), Math.max(...lon_item));
                bounds = L.latLngBounds(southWest, northEast);
                // Fit the map
                map.fitBounds(bounds);
            }
        });
    });



$("#shpFile").on("change",  function(){
    // Lee el archivo desde la entrada de archivos
    var file = document.getElementById('shpFile').files[0];
    // Crea un objeto FileReader para leer el archivo
    var reader = new FileReader();
    reader.onload = function(e) {
        // Convierte el archivo shapefile a GeoJSON usando shpjs
        shp(e.target.result).then(function(geojson) {
            // Crea una capa de Leaflet con los datos del archivo GeoJSON
            if (typeof layerSHP !== 'undefined') {
                map.removeLayer(layerSHP)
            }
            layerSHP = L.geoJSON(geojson, { style: { weight: 1 } }).addTo(map);
            map.fitBounds(layerSHP.getBounds());
        });
    };
  // Lee el archivo como una URL de datos
  reader.readAsDataURL(file);
});





$('#check-000yr').on('change', function () {
    if($('#check-000yr').is(':checked')){
        est_R000.addTo(map);
    } else {
        map.removeLayer(est_R000); 
    };
});

$('#check-002yr').on('change', function () {
    if($('#check-002yr').is(':checked')){
        est_R002.addTo(map);
    } else {
        map.removeLayer(est_R002); 
    };
});

$('#check-005yr').on('change', function () {
    if($('#check-005yr').is(':checked')){
        est_R005.addTo(map);
    } else {
        map.removeLayer(est_R005); 
    };
});

$('#check-010yr').on('change', function () {
    if($('#check-010yr').is(':checked')){
        est_R010.addTo(map);
    } else {
        map.removeLayer(est_R010); 
    };
});

$('#check-025yr').on('change', function () {
    if($('#check-025yr').is(':checked')){
        est_R025.addTo(map);
    } else {
        map.removeLayer(est_R025); 
    };
});

$('#check-050yr').on('change', function () {
    if($('#check-050yr').is(':checked')){
        est_R050.addTo(map);
    } else {
        map.removeLayer(est_R050); 
    };
});

$('#check-100yr').on('change', function () {
    if($('#check-100yr').is(':checked')){
        est_R100.addTo(map);
    } else {
        map.removeLayer(est_R100); 
    };
});