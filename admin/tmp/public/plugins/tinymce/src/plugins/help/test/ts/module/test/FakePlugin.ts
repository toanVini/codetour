import PluginManager from 'tinymce/core/PluginManager';

const Plugin = function (editor, url) {
  return {
    getMetadata () {
      return {
        name: 'Fake',
        url: 'http://www.fake.com'
      };
    }
  };
};

PluginManager.add('fake', Plugin);

export default function () {}