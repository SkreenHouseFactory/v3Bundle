<?php

namespace SkreenHouseFactory\v3Bundle\DependencyInjection;

use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\Config\Resource\FileResource;
use Symfony\Component\Config\Definition\Processor;

class SkreenHouseFactoryV3Extension extends Extension
{
    public function load(array $configs, ContainerBuilder $container)
    {
        $loader = new YamlFileLoader($container, new FileLocator(__DIR__.'/../Resources/config'));

        //$processor     = new Processor();
        //$configuration = new Configuration();

        //$config = $processor->process($configuration->getConfigTree(), $configs);

        $loader->load('config.yml');
    }
}
