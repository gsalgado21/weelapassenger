import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, LoadingController, AlertController, ModalController, Events, ToastController } from 'ionic-angular';
import { ApiService } from '../../services/api-service';
//import { PerfilPage } from '../perfil/perfil';
import { UserPage } from '../user/user';

@IonicPage()
@Component({
  selector: 'page-carteira',
  templateUrl: 'carteira.html',
})
export class CarteiraPage {

  tab = "extrato";
  nota: number = 5;
  extrato = [];
  wallet: any;
  show = false;
  valores = [
    {
      value: 5,
      active: false
    },
    // {
    //   value: 10,
    //   active: false
    // },
    {
      value: 20,
      active: false
    },
    {
      value: 50,
      active: false
    },
    // {
    //   value: 100,
    //   active: false
    // },
    // {
    //   value: 150,
    //   active: false
    // }
  ];
  btnStart = false;
  addCard = false;
  card = {
    nomt: "",
    nmr: '',
    vldd: '',
    cdsg: ''
  };
  cards = [];
  transtant: any;
  flag: any;
  valormodal = null;
  outroValorI = null;
  cartao_valido: boolean = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private view: ViewController,
    //private service: FirebaseService,
    private loadingCtrl: LoadingController,
    private ngZone: NgZone,
    public alertCtrl: AlertController,
    public modal: ModalController,
    public events: Events,
    private toastCtrl: ToastController, 
    private api: ApiService
  ) {
    this.init();
  }

  showCardT(c) {
    console.log(c);
    this.addCard = true;
    this.card = c;
    this.card.nmr = c.nmrBackup;

  }

  transform(): any {
    this.wallet.valor = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(this.wallet.valor);
    this.wallet.executivo = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(this.wallet.executivo);
  }

  cardVer() {
    let flag = this.getCardFlag(this.card.nmr);
    this.ver_num_card(this.card.nmr);
    console.log(flag);
    this.flag = flag;
  }

  ver_num_card(cardnumber){
    var numero_limpo = cardnumber.replace(/[^\w\s]/gi, '')
    let soma = 0;
    let numString;
    console.log('numero caracteres', numero_limpo.length);
    if (numero_limpo.length == 16){
      
      for (let i = 0; i < numero_limpo.length ; i++){
        numString = numero_limpo.substr(i,1);
        console.log('digito', numString);
          if( i % 2 == 0){
            if((parseInt(numString, 10) * 2) > 9 ){
              soma += (parseInt(numString, 10) * 2) - 9;
              console.log('result', soma);
            } else {
              soma += (parseInt(numString, 10) * 2);
              console.log('result', soma);
            }
          } else {
            soma += (parseInt(numString, 10) * 1);
            console.log('result', soma);
          }
      }
      if ( (soma % 10) == 0) {
        this.cartao_valido = true;
        console.log('cartão_valido', this.cartao_valido);
      } else {
        this.cartao_valido = false;
        console.log('cartão_valido', this.cartao_valido);
      }


    } else {
      this.cartao_valido = null;
      console.log('cartão_valido', this.cartao_valido);
    }

  }

  getCardFlag(cardnumber) {
    var cardnumber = cardnumber.replace(/[^0-9]+/g, '');

    var cards = {
      visa: /^4[0-9]{12}(?:[0-9]{3})/,
      mastercard: /^5[1-5][0-9]{14}/,
      diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}/,
      amex: /^3[47][0-9]{13}/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{12}/,
      hipercard: /^(606282\d{10}(\d{3})?)|(3841\d{15})/,
      elo: /^((((636368)|(438935)|(504175)|(451416)|(636297))\d{0,10})|((5067)|(4576)|(4011))\d{0,12})/,
      jcb: /^(?:2131|1800|35\d{3})\d{11}/,
      aura: /^(5078\d{2})(\d{2})(\d{11})$/
    };

    for (var flag in cards) {
      if (cards[flag].test(cardnumber)) {
        return flag;
      }
    }

    return false;
  }

  init() {
    //Params
    let card = this.navParams.get('card');
    if (card) {
      this.addCard = true;
    }

    this.events.publish('wallet:created');
    this.tab = 'extrato';
    this.api.lastHash().then((r) => {
      this.transtant = r;
    })
    let load = this.loadingCtrl.create();
    load.present();

    //CARDS
    this.cards = [];
    this.api.getCards()
      .then((r) => {

        console.log('cards', r)
        let cards = JSON.parse(JSON.stringify(r));
        if (cards.length == 0) {
          this.addCard = true;
        }
        else {
          //Mascara de cartao
          cards.forEach((c) => {
            c['flag'] = this.getCardFlag(c.nmr);
            c.nmrBackup = c.nmr;
            c.nmr = c.nmr.replace(/.(?=.{4})/g, '•');
            console.log(c['flag']);

            if (c.stts == 'Ativo') {
              this.cards.push(c);
            }
          });

          // this.cards = cards;
          console.log('cards formateds', r)
        }
      })

    this.api.getWallet().then((r) => {
      this.wallet = JSON.parse(JSON.stringify(r))[0].wallet;
      console.log('wallet', this.wallet);
      this.transform();

      this.api.getWalletExtrato().then((r) => {
        this.extrato = JSON.parse(JSON.stringify(r));

        this.extrato.forEach((e) => {
          if (this.wallet.publickey == e.vout) {
            e['saida'] = true;
          }
          else if (this.wallet.publickey == e.vin) {
            e['entrada'] = true
          }
          else {
            e['entrada'] = true;
          }
          if (e.avaliado == "sim") {
            e['avaliado'] = true;
          } else {
            e['avaliado'] = false;
          }
        });

        console.log('extrato', this.extrato);
        load.dismiss();
      });
    });
  }

  trashCard() {
    let load = this.loadingCtrl.create();
    load.present();
    let user = JSON.parse(localStorage.getItem('user'));
    console.log('editar');
    let data = {
      passageiro_id: user.id,
      nomt: this.card.nomt,
      nmr: this.card.nmr,
      stts: 'Desativado',
      cdsg: this.card.cdsg,
      vldd: this.card.vldd,
      id: this.card['id']
    };

    this.api.editCard(data)
      .then((r) => {
        // load.dismiss();
        // this.addCard = false;

        this.view.dismiss();
        let modal = this.modal.create('CarteiraPage');
        modal.present();
      })
      .catch(() => {
        this.view.dismiss();
        let modal = this.modal.create('CarteiraPage');
        modal.present();
      })
  }

  newCard() {
    console.log(this.card);
    let load = this.loadingCtrl.create();
    load.present();

    let user = JSON.parse(localStorage.getItem('user'));
    if (!this.card['id']) {
      let data = {
        passageiro_id: user.id,
        nomt: this.card.nomt,
        nmr: this.card.nmr.replace(/[^\w\s]/gi, ''),
        stts: 'Ativo',
        cdsg: this.card.cdsg,
        vldd: this.card.vldd.replace(/[^\w\s]/gi, '')
      };
      console.log('data cartao', data);
      this.api.newCard(data)
        .then((r) => {
          // load.dismiss();
          // this.addCard = false;

          this.view.dismiss();
          let modal = this.modal.create('CarteiraPage');
          modal.present();
        })
    }
    else {
      console.log('editar');
      let data = {
        passageiro_id: user.id,
        nomt: this.card.nomt,
        nmr: this.card.nmr,
        stts: 'Ativo',
        cdsg: this.card.cdsg,
        vldd: this.card.vldd,
        id: this.card['id']
      };

      this.api.editCard(data)
        .then((r) => {
          // load.dismiss();
          // this.addCard = false;

          this.view.dismiss();
          let modal = this.modal.create('CarteiraPage');
          modal.present();
        })
        .catch(() => {
          this.view.dismiss();
          let modal = this.modal.create('CarteiraPage');
          modal.present();
        })
    }

  }

  activeItem(i) {
    console.log('active', i);
    this.valores.forEach((v) => {
      v.active = false;
    })

    this.ngZone.run(() => {
      this.valores[i].active = true;
    })

    this.btnStart = true;
    console.log(this.valores);
  }

  outroValor() {
    // valormodal
    const prompt = this.alertCtrl.create({
      title: 'Outro valor',
      message: "Digite o valor desejado",
      inputs: [
        {
          name: 'Valor',
          placeholder: 'Valor'
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
          }
        },
        {
          text: 'Confirmar',
          handler: data => {
            this.valores.forEach((v) => {
              v.active = false;
            })
            let obj = {
              value: parseInt(data.Valor),
              active: true
            }
            this.valores.push(obj);
            console.log(this.valores);
            this.recarga();
          }
        }
      ]
    });


    prompt.present();
  }

  close() {
    this.view.dismiss()
  }

  toRecarga() {
    console.log('TO RECARGA');
    if (this.cards.length > 0) {
      this.recarga();
    }
    else {
      let alert = this.alertCtrl.create();
      alert.setTitle('Ops!');
      alert.setMessage('Adicione um cartão de crédito antes de continuar.');
      alert.addButton({
        text: 'Continuar',
        handler: cardId => {
          this.addCard = true;
        }
      });

      alert.present();
    }
  }

  recarga() {
    console.log('recarga');
    if (!this.outroValorI) {
      let alert = this.alertCtrl.create();
      alert.setTitle('Selecione o cartão de crédito');


      this.cards.forEach((c) => {
        alert.addInput({
          type: 'radio',
          label: c.nmr,
          value: c.id,
          checked: false
        });
      })


      alert.addButton('Cancelar');
      alert.addButton({
        text: 'Continuar',
        handler: cardId => {
          let load = this.loadingCtrl.create();
          load.present();

          let value = "";
          this.valores.forEach((v) => {
            if (v.active) {
              value = v.value.toString() + ".00";
            }
          });

          let data = {
            idusr: JSON.parse(localStorage.getItem('user')).id,
            idcrt: cardId,
            vlr: value,
            wllt: this.wallet.id,
            hshant: this.transtant,
          };

          //REMOVER
          // let url = "http://busdriver.mobi:12029/c/rcrg?idusr=1&idcrt=2&vlr=5.00&wllt=8&hshant=3ff6d98303322cd41afda531461fc7c8f3e46ee1ad0a80aedfc1c584c91e219b";
          let url = 'https://api.valipag.com.br/c/rcrg?idusr=' + data.idusr + '&idcrt=' + data.idcrt + '&vlr=' + data.vlr + '&wllt=' + data.wllt + '&hshant=' + data.hshant;

          data['url'] = url;
          console.log(data);


          this.api.recarga1(data)
            .then((r) => {
              console.log('recarga', r);
              if (r[0].recarga.confirmacao == '500') {
                load.dismiss();
                const alert = this.alertCtrl.create({
                  title: 'Ops!',
                  subTitle: 'Ocorreu algum erro, por favor, tente novamente mais tarde.',
                  buttons: ['Voltar']
                });
                alert.present();
              }
              else {
                let recarga1 = r[0].recarga;
              
                let recarga = {
                  vin: recarga1.vin,
                  vout: recarga1.vout,
                  valor: recarga1.valor,
                  privatekey: recarga1.privatekey,
                  assinaturakey: recarga1.assinaturakey,
                  transacaoprevkey: recarga1.transacaoprevkey,
                  bloco_id: parseInt(recarga1.bloco_id),
                  imova: recarga1.imova,
                  ccrdt_id: parseInt(recarga1.ccrdt_id),
                  obs: 'Recarga',
                  perna: null,
                  pagamento_id: null,
                  status: recarga1.status
                };

                this.api.recarga2(recarga)
                  .then((r) => {
                    console.log('recarga2', r);
                    load.dismiss();
                    this.init();

                    const alert = this.alertCtrl.create({
                      title: 'Sucesso!',
                      subTitle: 'Sua recarga está em análise, assim que aprovada seu saldo será atualizado.',
                      buttons: ['Voltar']
                    });
                    alert.present();
                  })
              }
            });
        }
      });
      alert.present();
    }
    else {
      this.valores.forEach((v) => {
        v.active = false;
      })
      let obj = {
        value: parseInt(this.outroValorI),
        active: true
      }
      this.valores.push(obj);
      console.log(this.valores);
      this.recarga2();
    }
  }

  recarga2() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Selecione o cartão de crédito');


    this.cards.forEach((c) => {
      alert.addInput({
        type: 'radio',
        label: c.nmr,
        value: c.id,
        checked: false
      });
    })


    alert.addButton('Cancelar');
    alert.addButton({
      text: 'Continuar',
      handler: cardId => {
        let load = this.loadingCtrl.create();
        load.present();

        let value = "";
        this.valores.forEach((v) => {
          if (v.active) {
            value = v.value.toString() + ".00";
          }
        });

        let data = {
          idusr: JSON.parse(localStorage.getItem('user')).id,
          idcrt: cardId,
          vlr: value,
          wllt: this.wallet.id,
          hshant: this.transtant,
        };

        //REMOVER
        // let url = "http://busdriver.mobi:12029/c/rcrg?idusr=1&idcrt=2&vlr=5.00&wllt=8&hshant=3ff6d98303322cd41afda531461fc7c8f3e46ee1ad0a80aedfc1c584c91e219b";
        let url = 'http://busdriver.mobi:12029/c/rcrg?idusr=' + data.idusr + '&idcrt=' + data.idcrt + '&vlr=' + data.vlr + '&wllt=' + data.wllt + '&hshant=' + data.hshant;

        data['url'] = url;
        console.log(data);


        this.api.recarga1(data)
          .then((r) => {
            console.log('recarga', r);
            if (r[0].recarga.confirmacao == '500') {
              load.dismiss();
              const alert = this.alertCtrl.create({
                title: 'Ops!',
                subTitle: 'Ocorreu algum erro, por favor, tente novamente mais tarde.',
                buttons: ['Voltar']
              });
              alert.present();
            }
            else {
              let recarga1 = r[0].recarga;
              let transacao = {
                vin: recarga1.vin,
                vout: recarga1.vout,
                valor: recarga1.valor,
                privatekey: recarga1.privatekey,
                assinaturakey: recarga1.assinaturakey,
                transacaoprevkey: recarga1.transacaoprevkey,
                bloco_id: parseInt(recarga1.bloco_id),
                imova: recarga1.imova,
                ccrdt_id: parseInt(recarga1.ccrdt_id),
                obs: 'Recarga', 
                perna: null,
                pagamento_id: null
              };

              this.api.recarga2(transacao)
                .then((r) => {
                  console.log('recarga2', r);
                  load.dismiss();
                  this.init();

                  const alert = this.alertCtrl.create({
                    title: 'Sucesso!',
                    subTitle: 'Recarga efetuada.',
                    buttons: ['Voltar']
                  });
                  alert.present();
                })
            }
          });
      }
    });
    alert.present();
  }

  enviar_avaliação(){

  }

  avaliar(lnh_id, prefixo, transacao_id) {
    // this.socialSharing.share('Texto aqui', null, null, null);
    let user = JSON.parse(localStorage.getItem('user'))
    console.log(user.id, lnh_id, prefixo, transacao_id);
    localStorage.setItem('passageiro_id', user.id);
    localStorage.setItem('lnh_id', lnh_id);
    localStorage.setItem('prefixo', prefixo);
    localStorage.setItem('transacao_id', transacao_id);

    let prompt = this.modal.create(
      //component: AvaliacaoPage,
        'AvaliacaoPage',
        {},
        {cssClass: 'select-modal' }
        );

    prompt.present();
  }

  ionViewDidLoad() {
    setTimeout(() => {
      let user = JSON.parse(localStorage.getItem('user'))
      console.log('user on home', user);
      if (user.rg == null || user.cpf == null) {
        const toast = this.toastCtrl.create({
          message: 'Por favor, complete todo o seu perfil.',
          duration: 3000
        });
        toast.present();

        let modal = this.modal.create(UserPage, { complete: true })
        modal.present();
      }
    }, 500)
  }

}
