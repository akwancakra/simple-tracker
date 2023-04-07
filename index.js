import chalk from 'chalk';
import clear from 'clear';
import readline from 'readline';
import ValorantApi from 'unofficial-valorant-api';
import { match } from 'assert';

// =======================================
//
// AKWAN CAKRA TAJIMALELA (2209098)
// MOHAMMAD RAYA SATRIATAMA (2206418)
// RPL 2B
// 
// =======================================

let NAME, TAG, LEVEL, SERVER, RANK, PUUID;
const Val = new ValorantApi();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function getInput(QUESTION) {
    return new Promise((resolve) => {
        rl.question(QUESTION, (input) => {
            resolve(input);
        });
    });
}

function accountInfo (account, rank){
    // NAME = account.data.name;
    if(account){
        LEVEL = account.data.account_level;
        PUUID = account.data.puuid;

        switch(account.data.region) {
            case "ap":
                SERVER = "Asia-Pacific";
                break;
            case "na":
                SERVER = "North America";
                break;
            case "eu":
                SERVER = "Europe";
                break;
            case "kr":
                SERVER = "Korea";
                break;
            default:
                console.log("Region\t\t: Not Identified");
        }
    }

    if(rank){
        RANK = rank;
    }
}

async function getRank(version, region, name, tag, filter) {
  try {
    const act = await Val.getMMR({ version, region, name, tag, filter });
    if (!act.error) {
      return act.data.final_rank_patched;
    }
    console.log(act.status);
  } catch (error) {
    console.error(error);
  }
}

try {
    const accountName = await getInput("Masukan akun NAMA#TAG\t: ");
    [NAME, TAG] = accountName.split('#');
    clear();

    console.log("Sedang memuat data dari API...");
    const account = await Val.getAccount({ name: NAME, tag: TAG });
    const rank = await getRank("v2", "ap", NAME, TAG, "e6a2");
    const matches = await Val.getMatches({ region: "ap", name: NAME, tag: TAG });
    accountInfo(account, rank);
    clear();

    if (account.error) {
        console.log(account.status);
    } else {
        console.log(`Account Name\t: ${NAME}#${TAG}`);
        console.log(`Region\t\t: ${SERVER}`);
        console.log(`Level\t\t: ${LEVEL}`);
        console.log(`Current Rank\t: ${RANK}\n`);

        let num = 0;
        matches.data.forEach(match => {
            // console.log(match.players);
            if (match.metadata.mode == "Competitive" || match.metadata.mode == "Unrated") {
                const yourPlayer = match.players.all_players.find(player => player.puuid == PUUID);
                const kda = yourPlayer.stats.kills + "/" + yourPlayer.stats.deaths + "/" + yourPlayer.stats.assists;
                const team = yourPlayer.team;
                const agent = yourPlayer.character;
                const current_rank = yourPlayer.currenttier_patched;
                let result;

                match.players.all_players.sort((a, b) => b.stats.score - a.stats.score);
                const index = match.players.all_players.findIndex(player => player.puuid === PUUID);
                
                num++;
                console.log(`-----------------Game ${num}-----------------`);
                console.log(`Tanggal\t: ${match.metadata.game_start}`);
                console.log(`Map\t: ${match.metadata.map}`);
                console.log(`Mode\t: ${match.metadata.mode}`);
                console.log(`Server\t: ${match.metadata.cluster}`);
                console.log("-----------------DETAIL------------------");
                console.log(`Team\t: ${team}`);
                console.log(`No\t: #${index+1}`);
                console.log(`Agent\t: ${agent}`);
                console.log(`Rank\t: ${current_rank}`);
                console.log(`KDA\t: ${kda}`);

                if (yourPlayer.team == "Red") {
                    console.log(`R. Won\t: ${match.teams.red.rounds_won}`);
                    console.log(`R. Lost\t: ${match.teams.red.rounds_lost}`);
                    result = match.teams.red.has_won ? "WON" : "LOST";

                } else {
                    console.log(`R. Won\t: ${match.teams.blue.rounds_won}`);
                    console.log(`R. Lost\t: ${match.teams.blue.rounds_lost}`);
                    result = match.teams.blue.has_won ? "WON" : "LOST";
                }

                if (result == "WON") {
                    console.log(`Result\t: ${chalk.greenBright(result)}\n`);
                } else if (result == "LOST") {
                    console.log(`Result\t: ${chalk.redBright(result)}\n`);
                }
            }
        });
    }
    console.log("Terima kasih telah menggunakan program.");
    process.exit();
} catch (error) {
    console.error(error.message);
}