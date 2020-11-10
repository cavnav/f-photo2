app = {
  client: {
    ControlPanel: {
      actions: {
        copy: {

        },
        browse: {
          

        },
        print: {

        },
        share: {

        },
        help: {

        },
      },

    },
    Share: {
      state: {
        forceUpdate: false,
        printState: {
          "br/20170107_112131.jpg": { // путь до файла.
            toPrint: 1, // запросы.
            toShare: 0,
          },
        },
      },
      API: {
        getItems: {
          names: [
            'Мамао',   'Мама',
            'Минаев',  'Феликс',
            'Любимая', 'Лариса',
            'Вика',    'Женя',
            'Эля',     'Польза'
          ],
          files: ['1.webp', '11.webp', '12.webp'],
          date: '2020-10-22',
        }
      }

    },
    Print: {
      
    },
    FileStatuses: {
      "br/20170107_112131.jpg": { // путь до файла.
        toPrint: false, 
        toShare: false,
      }
    },
    photoState: {
      files: [],
      dirs: [],
    },
    resume: {
      leftWindow: {

      },
      rightWindow: {

      },
      browserCount: 0,
      toPrint: {},
      toShare: {},
    }
  },
  server: {
    rootDir: 'C:\\Users\\shelm\\Pictures',    
    sharedDir: '..\\..\\..\\shared',
    $share: {
      WhatsappBot: {
        names: [
          { name: 'Мамао', title: 'Извини, тест' },
          { name: 'Мама', title: 'Извини, тест' },
          { name: 'Минаев', title: 'Извини, тест' },
          { name: 'Феликс', title: 'Извини, тест' },
          { name: 'Любимая', title: 'Извини, тест' },
          { name: 'Лариса', title: 'Извини, тест' },
          { name: 'Вика', title: 'Извини, тест' },
          { name: 'Женя', title: 'Извини, тест' },
          { name: 'Эля', title: 'Извини, тест' },
          { name: 'Польза', title: 'Извини, тест' }
        ],
        sharedFolder: '../../shared/2020-10-22',
      }
    }
  },
};